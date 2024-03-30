/** 将标题转化为用户讨论名字空间格式 */
export const formatNS3 = (title: string) => {
  return title.replace(/^ *(?:User[_ ]talk:|用[户戶][讨討][论論]:|使用者[讨討][论論]:|U:|User:|用[户戶]:)?(.*)$/i, 'User_talk:$1');
};

/** 将标题转化为分类名字空间格式 */
export const formatNS14 = (title: string) => {
  return title.replace(/^ *(?:Category:|CAT:|分[类類]:)?(.*)$/i, 'Category:$1');
};
