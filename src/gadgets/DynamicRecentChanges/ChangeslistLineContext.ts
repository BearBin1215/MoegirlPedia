import { createContext } from 'react';

/** 最近更改/日志上下文数据 */
interface ChangeslistLineContextValue {
  tagMeanings: Record<string, string>;
  groupMeanings: Record<string, string>;
}

const ChangeslistLineContext = createContext<ChangeslistLineContextValue>({
  tagMeanings: {},
  groupMeanings: {},
});

export default ChangeslistLineContext;
