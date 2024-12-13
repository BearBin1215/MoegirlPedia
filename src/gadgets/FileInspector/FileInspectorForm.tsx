import React, {
  Fragment,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  type MouseEvent,
  type ChangeEvent,
  type FC,
} from 'react';
import { chunk } from 'lodash-es';
import {
  Button,
  NumberInput,
  type InputWidgetRef,
} from 'oojs-ui-react';
import { copyText } from '@/utils/clipboard';
import waitInterval from '@/utils/wait';
import { categoryMembers } from '@/utils/api';
import type { ApiQueryResponse, GlobalUsage } from '@/@types/api';

interface BasicFileData {
  title: string;
  timestamp: string;
}

interface FileData {
  /** 文件页面ID */
  id: number;
  /** 文件名 */
  fileName: string;
  /** 上传时间 */
  uploadTime: string;
  /** 使用情况 */
  usage: GlobalUsage[];
  /** 是否已选中 */
  selected: boolean;
  /** 是否已挂删 */
  deleted: boolean;
  /** 是否在共享站使用 */
  cmused?: boolean;
}

const FileInspectorForm: FC<{ username: string }> = ({ username }) => {
  // 当前状态，就绪/读取失败/查询中/查询完毕
  const [status, setStatus] = useState<'ready' | 'failed' | 'querying' | 'acquired'>('ready');
  // 挂删状态
  const [deleteStatus, setDeleteStatus] = useState<'ready' | 'deleting' | 'done'>('ready');
  // 失败原因
  const [failReason, setFailReason] = useState('');
  // 文件列表，用于显示
  const [fileUsageData, setFileUsageData] = useState<FileData[]>([]);
  // 挂删记录
  const [deleteRecord, setDeleteRecord] = useState<string[]>([]);
  // 复制状态
  const [copyButtonText, setCopyButtonText] = useState('复制文件列表');
  /** 用于记录非链入使用文件 */
  const usedNotLinkdRef = useRef<string[]>([]);
  /** 挂删间隔输入框 */
  const deleteIntervalInputRef = useRef<InputWidgetRef>(null);

  const api = useMemo(() => new mw.Api(), []);

  /** 是否为维护人员，用于判定能否执行挂删 */
  const isMaintainer = useMemo(() => {
    return mw.config.get('wgUserGroups')!.some((group) => ['sysop', 'patroller'].includes(group));
  }, []);

  /**
   * 获取用户上传的所有文件
   *
   * 萌百关闭了allimages接口，只能从用户贡献里面筛
   */
  const queryUserFiles = useCallback(async () => {
    /** 用户上传文件列表 */
    const userFileList: BasicFileData[] = [];
    let uccontinue: string | undefined = '|';
    while (uccontinue !== undefined) {
      const result = await api.post({
        format: 'json',
        utf8: true,
        action: 'query',
        list: 'usercontribs',
        ucprop: ['title', 'timestamp'],
        ucnamespace: 6,
        ucuser: username,
        ucshow: 'new',
        uclimit: 'max',
        uccontinue,
      }) as ApiQueryResponse;
      uccontinue = result.continue?.uccontinue;
      userFileList.push(...result.query.usercontribs.map(({ title, timestamp }) => ({
        title,
        timestamp,
      })));
    }
    return userFileList;
  }, []);

  /** 查询文件使用情况，并筛选掉正常使用的文件 */
  const queryFileUsage = useCallback(async (fileList: BasicFileData[]) => {
    const queryLimit = mw.config.get('wgUserGroups')!.some((group) => {
      return ['bot', 'flood', 'sysop'].includes(group);
    }) ? 500 : 50;
    const fileChunks = chunk(fileList, queryLimit);
    /** 筛选后的文件标题及其使用情况 */
    const filtedFileUsageData: FileData[] = [];
    for (const fileData of fileChunks) {
      let gucontinue: string | undefined = '||';
      while (gucontinue) {
        const result = await api.post({
          format: 'json',
          utf8: true,
          action: 'query',
          prop: 'globalusage',
          titles: fileData.map(({ title }) => title),
          gucontinue,
          gulimit: 'max',
        }) as ApiQueryResponse;
        gucontinue = result.continue?.gucontinue;
        for (const { pageid, title, globalusage } of Object.values(result.query.pages)) {
          // 已有记录的增加usage，没记录的创建记录
          const target = filtedFileUsageData.find(({ id }) => id === pageid);
          if (target) {
            target.usage.push(...globalusage);
          } else {
            filtedFileUsageData.push({
              id: pageid,
              fileName: title,
              uploadTime: moment(fileList.find((file) => file.title === title)!.timestamp)
                .format('YYYY年M月D日 HH:mm:ss'),
              usage: globalusage || [],
              selected: true,
              deleted: false,
            });
          }
        }
      }
    }
    console.log(filtedFileUsageData);
    // 全域文件使用不包括共享站使用，还需要筛选一轮本域使用
    const newChunks = chunk(filtedFileUsageData, queryLimit);
    for (const fileData of newChunks) {
      let fucontinue: string | undefined = '';
      while (fucontinue !== undefined) {
        const result = await api.post({
          format: 'json',
          utf8: true,
          action: 'query',
          prop: 'fileusage',
          titles: fileData.map(({ fileName }) => fileName),
          ...(fucontinue ? { fucontinue } : {}),
          fulimit: 'max',
        }) as ApiQueryResponse;
        fucontinue = result.continue?.fucontinue;
        for (const { pageid, fileusage } of Object.values(result.query.pages)) {
          if (fileusage?.length) {
            filtedFileUsageData.find(({ id }) => id === pageid)!.cmused = true;
          }
        }
      }
    }
    return filtedFileUsageData.filter(({ fileName, usage, cmused }) => {
      // 空数组调用every方法也返回true，无需额外判定
      return !cmused &&
        usage.every(({ title }) => title.match(/^User:/)) &&
        !usedNotLinkdRef.current.includes(fileName);
    });
  }, []);

  /** 执行查询 */
  const queryUserFilesUsage = useCallback(async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 避免触发提交跳转
    try {
      setStatus('querying');
      usedNotLinkdRef.current = await categoryMembers('Category:非链入使用的文件');
      const userFileList = await queryUserFiles(); // 获取用户上传过的文件
      const filtedFileUsageData = await queryFileUsage(userFileList); // 根据上传的文件查询使用情况
      setFileUsageData(filtedFileUsageData);
      setStatus('acquired');
    } catch (err) {
      setStatus('failed');
      setFailReason(err as string);
    }
  }, []);

  /** 勾选框内容变动，更新已选文件 */
  const handleCheck = useCallback((e: ChangeEvent<HTMLInputElement>, fileName: string) => {
    setFileUsageData((prev) => prev.map((file) =>
      file.fileName === fileName ? {
        ...file,
        selected: e.target.checked,
      } : file,
    ));
  }, []);

  const handleDelete = useCallback(async (e: MouseEvent<HTMLButtonElement>) => {
    const interval = deleteIntervalInputRef.current!.getValue() * 1000;
    e.preventDefault(); // 避免触发提交跳转
    const currentUser = mw.config.get('wgUserName');
    const fileList = fileUsageData.filter(({ selected }) => selected);
    if (fileList.length === 0) {
      return;
    }
    setDeleteStatus('deleting');
    let done = 0;
    for (const { fileName, usage: { length } } of fileList) {
      const reason = length ? '仅用于用户、用户讨论名字空间内的用途不当文件' : '无使用或不再使用的文件';
      try {
        await api.postWithToken('csrf', {
          action: 'edit',
          assertUser: currentUser!,
          title: fileName,
          text: `<noinclude>{{即将删除|1=${reason}|user=${currentUser}}}</noinclude>`,
          summary: `[[User:BearBin/js#FileInspector|FileInspector]]: 挂删：${reason}`,
          watchlist: 'nochange',
          tags: 'Automation tool',
          bot: true,
        });
        setFileUsageData((prev) => prev.map((file) =>
          file.fileName === fileName ? {
            ...file,
            deleted: true,
          } : file,
        ));
        setDeleteRecord((prev) => [
          ...prev,
          `${moment().format('HH:mm:ss')} - 【${fileName}】已挂删。`,
        ]);
      } catch (err) {
        setDeleteRecord((prev) => [
          ...prev,
          `${moment().format('HH:mm:ss')} - 【${fileName}】挂删失败：${err}`,
        ]);
      }
      done++;
      if (done < fileList.length) {
        await waitInterval(interval);
      }
    }
    setDeleteStatus('done');
  }, [fileUsageData]);

  /** 复制列表 */
  const handleCopy = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 避免触发提交跳转
    copyText(fileUsageData.map(({ fileName }) => `* ${fileName}`).join('\n')).then(() => {
      setCopyButtonText('复制成功');
    }).catch((err) => {
      setCopyButtonText(`复制失败：${err}`);
    });
  }, [fileUsageData]);

  useEffect(() => {
    mw.loader.using(['mediawiki.api', 'oojs-ui', 'moment']);
  }, []);

  return (
    <form id='file-inspector'>
      <fieldset>
        <legend>用户文件检查</legend>
        {status === 'ready' && (
          <>
            查询该用户所有未使用的文件信息
            <br />
            <Button onClick={queryUserFilesUsage} flags='progressive'>查询</Button>
          </>
        )}
        {status === 'querying' && '正在查询……'}
        {status === 'failed' && (
          <>
            查询失败：{failReason}
            <br />
            <Button onClick={queryUserFilesUsage}>重试</Button>
          </>
        )}
        {status === 'acquired' && (
          <>
            获取成功！该用户上传的无使用或仅用于用户页的文件如下：
            <dl>
              {fileUsageData.map(({ fileName, usage, selected, deleted, uploadTime }) => (
                <Fragment key={fileName}>
                  <dt>
                    {isMaintainer && (
                      <input
                        type='checkbox'
                        name={fileName}
                        defaultChecked
                        checked={selected && !deleted}
                        disabled={deleted || deleteStatus === 'deleting'}
                        onChange={(e) => handleCheck(e, fileName)}
                      />
                    )}
                    <a
                      href={`/${fileName}`}
                      style={{ textDecoration: deleted ? 'line-through' : '' }}
                      target='_blank'
                      rel='noreferrer'
                    >
                      {fileName}
                    </a>
                    <label
                      style={{ fontWeight: 'normal' }}
                      htmlFor={fileName}
                    >
                      （上传于 {uploadTime}）
                    </label>
                  </dt>
                  {usage.length ? usage.map(({ url, title }) => (
                    <dd key={title}>
                      <a href={url} target='_blank' rel='noreferrer'>{title}</a>
                    </dd>
                  )) : <dd>无使用</dd>}
                </Fragment>
              ))}
            </dl>
            <hr />
            <div className='file-inspector-panel'>
              {isMaintainer && (
                <Button
                  onClick={handleDelete}
                  disabled={deleteStatus === 'deleting'}
                  flags='progressive'
                >
                  挂删选中的文件
                </Button>
              )}
              挂删间隔（s）：
              <NumberInput min={0} defaultValue={6} ref={deleteIntervalInputRef} style={{ width: '5em' }} />
              <br />
              <Button onClick={handleCopy} style={{ marginTop: '0.4em' }}>{copyButtonText}</Button>
            </div>
            {deleteStatus !== 'ready' && (
              <ul className='file-inspector-log'>
                {deleteRecord.map((record) => <li key={record}>{record}</li>)}
              </ul>
            )}
          </>
        )}
      </fieldset>
    </form>
  );
};

export default FileInspectorForm;
