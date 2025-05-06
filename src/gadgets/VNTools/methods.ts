import { chunk } from 'lodash-es';
import { categoryMembers, pageSource } from '@/utils/api';
import type { ApiQueryResponse } from '@/@types/api';

const api = new mw.Api();

const queryLimit = mw.config.get('wgUserGroups')!.some((group) => {
  return ['bot', 'flood', 'sysop'].includes(group);
}) ? 500 : 50;

export const updateCVLastUpdateDate = async () => {
  const cvList = await categoryMembers('Category:R-18作品声优');
  const titleChunks = chunk(cvList, queryLimit);
  const lastUpdateData: { title: string, timestamp: string }[] = [];
  for (const titleChunk of titleChunks) {
    const revisions = await api.post({
      action: 'query',
      format: 'json',
      prop: 'revisions',
      titles: titleChunk.join('|'),
      rvprop: 'timestamp',
    }) as ApiQueryResponse;
    lastUpdateData.push(...Object.values(revisions.query.pages).map(({ title, revisions: [{ timestamp }] }) => ({
      title,
      timestamp,
    })));
  }
  const listText = lastUpdateData.sort((a, b) => {
    return (new Date(a.timestamp)) < (new Date(b.timestamp)) ? -1 : 1;
  }).map(({ title, timestamp }) => `* [[${title}]]：${moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}`).join('\n');
  await api.postWithToken('csrf', {
    action: 'edit',
    title: 'User:BearBin/VNData/Galgame声优更新时间',
    text: [
      '本页面统计[[:Category:R-18作品声优]]内页面的最后更新时间，提示可能需要更新的页面。\n',
      '您可以使用[[User:BearBin/VNData#VNTools|VNTools]]更新本页面。\n',
      listText,
    ].join('\n'),
    summary: '使用[[User:BearBin/VNData#VNTools|VNTools]]自动更新列表',
    bot: true,
    tags: 'Bot',
  });
  mw.notify('更新成功！即将刷新页面……');
  window.location.reload();
};


interface UserInfo {
  username: string;
  nickname: string;
  subscript: string;
}

export const updateNavbox = async () => {
  /**
   * 分析源代码，输出用户信息
   * @param {string} source 源代码
   */
  const parseTemplateSource = (source: string): UserInfo[] => {
    const list = source
      .replace(/.*<!-- *列表起点 *-->(.*)<!-- *列表终点 *-->.*/gs, '$1') // 识别列表起点终点
      .replace(/<!--[\s\S]*?-->/g, '') // 去除注释
      .replace(/\* */g, '') // 去除无序列表头
      .trim()
      .split('\n') // 分割为数组
      .map((str) => {
        const match = str.trim().match(/^([^<(]*)(\(([^)]*)\))?(<.*>)?$/); // 解析昵称和下标
        return {
          username: match![1],
          nickname: match![3],
          subscript: match![4],
        };
      });
    return list;
  };

  /**
   * 获取用户组信息
   * @param userList 用户列表
   */
  const getUserGroups = async (userList: string[]) => {
    const result: Record<string, string[]> = {};

    const userListChunks = chunk(userList, queryLimit);
    for (const listChunk of userListChunks) {
      const { query: { users } } = await api.post({
        action: 'query',
        list: 'users',
        ususers: listChunk.join('|'),
        usprop: 'groups',
      });
      users.forEach(({ name, groups }) => {
        result[name] = groups;
      });
    }
    return result;
  };

  /**
   * 将列表转为模板需要的字符串
   */
  const userListToString = (list: UserInfo[]) => {
    return list
      .map(({
        username,
        nickname,
        subscript,
      }) => `{{User|${username}${nickname ? `|${nickname}` : ''}}}${subscript || ''}`)
      .join(' • <!--\n    -->');
  };

  /** 提交编辑 */
  const submit = async (text: string) => {
    await api.postWithToken('csrf', {
      action: 'edit',
      title: 'Template:萌百视觉小说研究会',
      summary: '使用[[User:BearBin/VNData#VNTools|VNTools]]自动更新用户组信息',
      text,
      bot: true,
      tags: 'Bot',
    });
  };

  const source = (await pageSource('Template:萌百视觉小说研究会'))!;
  const userInfo = parseTemplateSource(source);
  const userGroups = await getUserGroups(userInfo.map(({ username }) => username));

  const groups = {
    maintainer: [] as UserInfo[], // 维护组
    autopatrolled: [] as UserInfo[], // 巡查豁免
    autoconfirmed: [] as UserInfo[], // 自确
  };
  for (const user of userInfo) {
    const userGroup = userGroups[(user.username.charAt(0).toUpperCase() + user.username.slice(1)).replace('_', ' ')];
    console.log(userGroups, (user.username.charAt(0).toUpperCase() + user.username.slice(1)).replace('_', ' '));
    if (userGroup.some((group) => ['sysop', 'patroller'].includes(group))) {
      groups.maintainer.push(user);
    } else if (userGroup.some((group) => ['goodeditor', 'honoredmaintainer'].includes(group))) {
      groups.autopatrolled.push(user);
    } else {
      groups.autoconfirmed.push(user);
    }
  }
  const output = source
    .replace(/(<!-- *维护人员 *-->).*(<!-- *维护人员 *-->)/gs, `$1${userListToString(groups.maintainer)}$2`)
    .replace(/(<!-- *优编荣维 *-->).*(<!-- *优编荣维 *-->)/gs, `$1${userListToString(groups.autopatrolled)}$2`)
    .replace(/(<!-- *自确 *-->).*(<!-- *自确 *-->)/gs, `$1${userListToString(groups.autoconfirmed)}$2`);
  if (output === source) {
    mw.notify('用户组信息无变化', { type: 'info' });
  } else {
    await submit(output);
    mw.notify('更新成功！即将刷新页面……');
    window.location.reload();
  }
};
