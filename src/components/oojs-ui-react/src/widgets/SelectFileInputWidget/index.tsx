import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
  type Ref,
} from 'react';
import clsx from 'clsx';
import { ActionFieldLayout } from '../../layouts/ActionFieldLayout';
import { getWidgetClassName, type AccessKeyedElement } from '../../utils';
import { useControlledValue, useLatestRef, useMergedRefs } from '../../hooks';
import { useMessage } from '../../config';
import { Button, type ButtonProps } from '../Button';
import { Icon } from '../Icon';
import { TextInput } from '../TextInput';
import type { WidgetProps } from '../Widget';

/** 空文件集常量（模块级，避免每次新建字面量） */
const NO_FILES: File[] = [];

/**
 * `DataTransfer`构造器可用性（Safari<14缺）：不可用时无法把文件集写回`input.files`，
 * 拖放能力一并关闭（对齐原版`canSetFiles`探测）
 */
const CAN_SET_FILES = (() => {
  try {
    new DataTransfer();
    return true;
  } catch {
    return false;
  }
})();

/**
 * 文件比较键：`File`的字段不可枚举，按原版`comparableFile`取size/type/lastModified/name
 * 四字段比较（忽略内容，故非严格相等）
 */
const comparableKey = (file: File) => (
  [file.name, file.size, file.type, file.lastModified].join('\u0000')
);

/** 两个文件集是否等价（长度相同且逐项比较键相同） */
const isSameFiles = (a: File[], b: File[]) => (
  a.length === b.length && a.every((file, index) => comparableKey(file) === comparableKey(b[index]))
);

/**
 * 读取图片文件的dataURL并校验其可解码（对齐原版`loadAndGetImageUrl`）：仅`image/*`且
 * 大小在上限内才尝试，解码失败（自然尺寸为0或未加载完成）时reject
 */
function loadImageUrl(file: File, sizeLimitMb: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!(file.type || '').startsWith('image/') || file.size >= sizeLimitMb * 1024 * 1024) {
      reject(new Error('not a thumbnailable image'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = String(event.target?.result ?? '');
      const image = document.createElement('img');
      image.addEventListener('load', () => {
        if (image.naturalWidth === 0 || image.naturalHeight === 0 || image.complete === false) {
          reject(new Error('not decodable'));
        } else {
          resolve(url);
        }
      });
      image.addEventListener('error', () => reject(new Error('load failed')));
      image.src = url;
    };
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

export interface SelectFileInputWidgetProps extends
  Omit<WidgetProps<HTMLDivElement>, 'children' | 'onChange'>,
  AccessKeyedElement {

  /**
   * 当前文件集（受控，传入即受控模式；空数组即未选择）。
   * 原版`getValue`单选时返回单个`File`，本工程与其余受控组件一致统一为数组，
   * 单选形态由`multiple`决定（非多选时只保留首个文件）
   */
  value?: File[];

  /** 非受控初始文件集 */
  defaultValue?: File[];

  /**
   * 文件集变化回调。触发时机对齐原版：选择、拖放、清除、以及受控值写回后
   * 的变更路径；文件集与原值等价（见`comparableKey`）时不触发
   */
  onChange?: (files: File[]) => void;

  /** 接受的文件类型（MIME或`image/*`形态；同时写入`accept`属性并按此过滤用户选择与拖放） */
  accept?: string[];

  /** 是否多选 */
  multiple?: boolean;

  /** 是否可拖放（对齐原版`config.droppable`，缺省true；`DataTransfer`不可用时强制关闭） */
  droppable?: boolean;

  /** 是否使用拖放区形态（整块可拖放与点击，对齐原版`config.showDropTarget`，须`droppable`） */
  showDropTarget?: boolean;

  /** 只渲染选择按钮（对齐原版`config.buttonOnly`；优于`showDropTarget`） */
  buttonOnly?: boolean;

  /** 缩略图大小上限（MB，超过则不加载缩略图，对齐原版`config.thumbnailSizeLimit`缺省20） */
  thumbnailSizeLimit?: number;

  /** 信息框占位文案（缺省取`ooui-selectfile-placeholder`消息） */
  placeholder?: string;

  /** 信息框图标（缺省无图标，对齐原版`setIcon(config.icon)`；须显式传入） */
  icon?: string;

  /** 是否必填（对齐原版`RequiredElement`：写在文件`input`的`required`上，信息框不显示required指示器） */
  required?: boolean;

  /** 文件字段名（写在文件`input`的`name`上，用于表单提交） */
  name?: string;

  /** 选择按钮文案（缺省按`multiple`取`ooui-selectfile-button-select[-multiple]`消息） */
  buttonLabel?: string;

  /** 选择按钮属性覆盖（对齐原版`config.button`；`disabled`/`onClick`由本组件接管） */
  buttonProps?: Omit<ButtonProps, 'children' | 'disabled' | 'onClick' | 'anchorContent' | 'anchorRef'>;

  /** 获取内部文件`input`元素引用 */
  inputRef?: Ref<HTMLInputElement>;
}

/**
 * 文件选择输入框，对齐原版OO.ui.SelectFileInputWidget：信息框（只读展示文件名，清空指示器
 * 是唯一的清除入口）+ 选择按钮（`<input type=file>`覆盖在其锚点上，点击即开系统选择器），
 * 二者经ActionFieldLayout按`align='top'`排布；另有拖放区形态与只渲染按钮形态。
 *
 * 焦点与键盘：Tab停靠点是选择按钮（原版`$tabIndexed`让给`selectButton.$button`），
 * 信息框input为`tabindex=-1`（原版另把它恒置disabled以防被findFocusable取到），
 * 清除指示器置`tabindex=0`保证键盘可达。
 */
export const SelectFileInputWidget = forwardRef<HTMLDivElement, SelectFileInputWidgetProps>(({
  accessKey,
  accept,
  buttonLabel,
  buttonOnly = false,
  buttonProps,
  className,
  defaultValue,
  disabled,
  droppable = true,
  icon,
  inputRef,
  multiple = false,
  name,
  onChange,
  placeholder,
  required,
  showDropTarget = false,
  tabIndex,
  thumbnailSizeLimit = 20,
  value,
  ...rest
}, ref) => {
  const selectButtonMessage = useMessage(multiple
    ? 'ooui-selectfile-button-select-multiple'
    : 'ooui-selectfile-button-select');
  const placeholderMessage = useMessage('ooui-selectfile-placeholder');
  const dropLabelMessage = useMessage(multiple
    ? 'ooui-selectfile-dragdrop-placeholder-multiple'
    : 'ooui-selectfile-dragdrop-placeholder');
  const removeLabel = useMessage('ooui-item-remove');
  const { value: files, commit } = useControlledValue<File[]>(
    { value, defaultValue: defaultValue ?? NO_FILES },
    onChange,
  );
  const filesRef = useLatestRef(files);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const infoInputRef = useRef<HTMLInputElement>(null);
  const setFileInputRef = useMergedRefs(inputRef, fileInputRef);
  /** 拖放态类（canDrop/cantDrop），对齐原版onDragEnterOrOver/onDragLeave的类切换 */
  const [dropState, setDropState] = useState<'canDrop' | 'cantDrop' | null>(null);
  const [thumbnail, setThumbnail] = useState<{ url: string | null; failed: boolean }>({
    url: null,
    failed: false,
  });
  const [thumbnailPending, setThumbnailPending] = useState(false);

  const isDropTarget = droppable && CAN_SET_FILES && showDropTarget;
  // DataTransfer不可用时拖放一并关闭（对齐原版canSetFiles探测里对config.droppable的覆盖）
  const isDroppable = droppable && CAN_SET_FILES;
  // 拖放区形态取代了按钮形态（原版二者互斥，dropTarget分支优先）
  const isButtonOnly = !isDropTarget && buttonOnly;
  // 缩略图仅在拖放区且非多选时存在（原版：多选拖放区不加载缩略图）
  const useThumbnail = isDropTarget && !multiple;
  const acceptList = useMemo(() => (accept?.length ? accept : null), [accept]);

  /**
   * 按`accept`过滤（MIME全等或`image/*`前缀匹配；文件无type信息时一律放行，
   * 对齐原版`filterFiles`），用于选择结果与拖放的入参校验
   */
  const filterFiles = useCallback((list: ArrayLike<File>): File[] => {
    const candidates = Array.prototype.slice.call(list) as File[];
    if (!acceptList) {
      return candidates;
    }
    return candidates.filter((file) => {
      const mimeType = file.type;
      if (!mimeType) {
        return true;
      }
      return acceptList.some((accepted) => (
        accepted === mimeType
        || (accepted.endsWith('/*') && mimeType.startsWith(accepted.slice(0, -1)))
      ));
    });
  }, [acceptList]);

  /** 提交文件集：仅与原值不等价时向上提交（对齐原版`setValue`的比较语义，非多选时截首位） */
  const commitFiles = useCallback((next: File[]) => {
    const normalized = multiple ? next : next.slice(0, 1);
    const normalizedRef = multiple ? filesRef.current : filesRef.current.slice(0, 1);
    if (!isSameFiles(normalized, normalizedRef)) {
      commit(normalized.length ? normalized : NO_FILES);
    }
  }, [commit, filesRef, multiple]);

  // 受控值 → input.files（对齐原版setValue的DataTransfer写回）。DOM已是同一集合时不动，
  // 否则会把用户刚选中的文件清掉
  useEffect(() => {
    const input = fileInputRef.current;
    if (!input) {
      return;
    }
    if (!CAN_SET_FILES) {
      // 无法构造FileList时只能清空（对齐原版回退到InputWidget.setValue('')）
      if (!files.length) {
        input.value = '';
      }
      return;
    }
    if (isSameFiles(Array.from(input.files ?? []), files)) {
      return;
    }
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    input.files = dataTransfer.files;
  }, [files]);

  // 信息框的input恒为disabled：对齐原版setDisabled里无条件的
  // `info.$input.attr('disabled', true)`（原版借此让findFocusable取不到它）。
  // 该语义无法经TextInput的disabled表达——那个prop同时驱动根元素的禁用类，
  // 而根元素的禁用态须随组件disabled，故此处补写input自身
  useEffect(() => {
    if (infoInputRef.current) {
      infoInputRef.current.disabled = true;
    }
  });

  // 缩略图：仅单文件拖放区形态下加载（对齐原版updateUI的loadAndGetImageUrl分支），
  // 加载中给缩略图容器挂pending类，失败时改放attachment图标
  useEffect(() => {
    if (!useThumbnail || files.length === 0) {
      setThumbnail({ url: null, failed: false });
      setThumbnailPending(false);
      return;
    }
    let cancelled = false;
    setThumbnailPending(true);
    loadImageUrl(files[0], thumbnailSizeLimit)
      .then((url) => {
        if (!cancelled) {
          setThumbnail({ url, failed: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setThumbnail({ url: null, failed: true });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setThumbnailPending(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [files, useThumbnail, thumbnailSizeLimit]);

  /** 打开系统文件选择器（对齐原版onKeyPress/onDropTargetClick对`$input`触发click） */
  const openPicker = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  /** 用户在系统选择器里选定文件（对齐原版onFileSelected，选择结果按accept过滤） */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    commitFiles(filterFiles(event.target.files ?? []));
  };

  /** 信息框只有清空是有效操作（对齐原版onInfoChange：值非空时不改变文件集） */
  const handleInfoChange = (next: string) => {
    if (next === '') {
      commitFiles(NO_FILES);
    }
  };

  /** 拖放区空态时整块可点击开选择器（对齐原版updateUI：有文件时解绑root的click） */
  const handleRootClick = () => {
    if (files.length === 0) {
      openPicker();
    }
  };

  /** 拖入/拖过：按能否接收切换canDrop/cantDrop类并设置dropEffect（对齐原版onDragEnterOrOver） */
  const handleDragEnterOrOver = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const { dataTransfer } = event;
    if (disabled) {
      setDropState(null);
      dataTransfer.dropEffect = 'none';
      return;
    }
    const itemsOrFiles = dataTransfer.items || dataTransfer.files;
    const hasFiles = !!itemsOrFiles
      && Array.prototype.some.call(
        itemsOrFiles,
        (item: DataTransferItem | File) => (item as DataTransferItem).kind === 'file',
      );
    let hasDroppableFile = false;
    if (hasFiles) {
      hasDroppableFile = filterFiles(itemsOrFiles as unknown as File[]).length > 0;
    } else if (Array.prototype.includes.call(dataTransfer.types ?? [], 'Files')) {
      // 此时浏览器不提供文件信息（安全限制），先按可接收处理（对齐原版）
      hasDroppableFile = true;
    }
    setDropState(hasDroppableFile ? 'canDrop' : hasFiles ? 'cantDrop' : null);
    if (!hasDroppableFile) {
      dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragLeave = () => {
    setDropState(null);
  };

  /** 落放：按accept过滤后入库（对齐原版onDrop） */
  const handleDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDropState(null);
    if (disabled) {
      return;
    }
    commitFiles(filterFiles(event.dataTransfer.files ?? []));
  };

  const fileName = files.map((file) => file.name).join(', ');
  const showClear = fileName !== '' && !disabled;
  const isEmpty = files.length === 0;
  // 类序对齐原版：基础类→构造期形态类（dropTarget/withThumbnail/buttonOnly）→`-empty`
  // （原版由构造末尾的updateUI追加，故在形态类之后）→运行期拖放态类
  const rootClasses = clsx(
    className,
    getWidgetClassName({ disabled }, 'input', 'selectFileInput'),
    'oo-ui-selectFileWidget',
    isDropTarget && 'oo-ui-selectFileInputWidget-dropTarget oo-ui-selectFileWidget-dropTarget',
    useThumbnail && 'oo-ui-selectFileInputWidget-withThumbnail oo-ui-selectFileWidget-withThumbnail',
    isButtonOnly && 'oo-ui-selectFileInputWidget-buttonOnly oo-ui-selectFileWidget-buttonOnly',
    isEmpty && 'oo-ui-selectFileInputWidget-empty',
    dropState === 'canDrop' && 'oo-ui-selectFileInputWidget-canDrop oo-ui-selectFileWidget-canDrop',
    dropState === 'cantDrop' && 'oo-ui-selectFileInputWidget-cantDrop',
  );

  const fileInput = (
    <input
      ref={setFileInputRef}
      className='oo-ui-inputWidget-input'
      type='file'
      // 选择按钮才是Tab停靠点（原版把$tabIndexed让给selectButton.$button）
      tabIndex={-1}
      name={name}
      accessKey={accessKey}
      // 空title抑制浏览器对file input的默认提示（原版静态title=''，经TitledElement落在$input上）
      title=''
      accept={acceptList ? acceptList.join(', ') : undefined}
      multiple={multiple || undefined}
      required={required}
      disabled={disabled}
      onChange={handleInputChange}
      // 阻止冒泡：拖放区形态下按钮的click会被root的“空态整块可点击”再处理一次
      // （对齐原版$input的click stopPropagation）
      onClick={(event) => event.stopPropagation()}
    />
  );

  const infoField = (
    <TextInput
      className='oo-ui-selectFileInputWidget-info'
      type='search'
      icon={icon}
      indicator={showClear ? 'clear' : undefined}
      // 清除是唯一的清除入口，须键盘可达（对齐原版info.$indicator.attr('tabindex', 0)）
      indicatorProps={{
        role: 'button',
        tabIndex: 0,
        ...(showClear
          ? {
            'aria-label': removeLabel,
            onClick: () => commitFiles(NO_FILES),
            onKeyDown: (event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commitFiles(NO_FILES);
              }
            },
          }
          : {}),
      }}
      // 信息框自身移出Tab序（对齐原版info.$input的tabindex=-1）
      tabIndex={-1}
      inputRef={infoInputRef}
      placeholder={placeholder ?? placeholderMessage}
      value={fileName}
      onChange={handleInfoChange}
      disabled={disabled}
    />
  );

  const selectButton = (
    <Button
      // buttonOnly时根元素即按钮：调用方的DOM属性随之落到按钮上（对齐原版把$element替换为按钮）
      {...(isButtonOnly ? rest as Partial<ButtonProps> : {})}
      {...buttonProps}
      ref={isButtonOnly ? ref as Ref<HTMLSpanElement> : undefined}
      className={clsx(
        buttonProps?.className,
        'oo-ui-selectFileInputWidget-selectButton',
        isButtonOnly && rootClasses,
      )}
      title={buttonProps?.title}
      disabled={disabled}
      icon={isDropTarget ? 'upload' : buttonProps?.icon}
      tabIndex={tabIndex}
      onClick={openPicker}
      anchorContent={fileInput}
    >
      {buttonLabel ?? selectButtonMessage}
    </Button>
  );

  if (isButtonOnly) {
    return selectButton;
  }

  return (
    <div
      {...rest}
      ref={ref}
      className={rootClasses}
      aria-disabled={disabled || undefined}
      onClick={isDropTarget ? handleRootClick : undefined}
      onDragEnter={isDroppable ? handleDragEnterOrOver : undefined}
      onDragOver={isDroppable ? handleDragEnterOrOver : undefined}
      onDragLeave={isDroppable ? handleDragLeave : undefined}
      onDrop={isDroppable ? handleDrop : undefined}
    >
      {isDropTarget ? (
        <>
          {useThumbnail && (
            <div
              className={clsx(
                'oo-ui-selectFileInputWidget-thumbnail oo-ui-selectFileWidget-thumbnail',
                thumbnailPending && 'oo-ui-pendingElement-pending',
              )}
              style={thumbnail.url ? { backgroundImage: `url( ${thumbnail.url} )` } : undefined}
            >
              {thumbnail.failed && (
                <Icon
                  className='oo-ui-selectFileInputWidget-noThumbnail-icon oo-ui-selectFileWidget-noThumbnail-icon'
                  icon='attachment'
                />
              )}
            </div>
          )}
          {infoField}
          {selectButton}
          <span className='oo-ui-selectFileInputWidget-dropLabel oo-ui-selectFileWidget-dropLabel'>
            {dropLabelMessage}
          </span>
        </>
      ) : (
        <ActionFieldLayout align='top' button={selectButton}>
          {infoField}
        </ActionFieldLayout>
      )}
    </div>
  );
});

SelectFileInputWidget.displayName = 'SelectFileInputWidget';
