# Snake

用于提供进度显示，通过创建一个Snake对象以创建进度条，并使用各种方法来控制其显示状况。

进度条由多个小方框组成，一个小方框对应一个项目，项目会根据其状态改变样式。

* 构思、实现：[鬼影233](https://github.com/gui-ying233)
* 封装：[BearBin](https://github.com/BearBin1215)

## 构造

```JavaScript
new Snake(token: object)
```

创建一个Snake对象，输入参数`token`为JavaScript对象，其中

* `token.hasHead`会用于设置Snake对象的hasHead属性值；
* `token.hasHref`会用于设置Snake对象的hasHref属性值；
* 其他属性会用于设置对象元素的HTML属性，如class、id等。

## 元素
* **`element`**: object
  * Snake对象对应的HTML元素节点，由`head`（若`hasHead !== false`）和`body`组成。
* **`head`**: object
  * 文字进度对应的HTML元素节点。
* **`body`**: object
  * 进度条主体对应的HTML元素节点。

## 属性

* **`blocks`**：Object
  * 进度条内各个块组成的对象。

* **`hasHead`**：boolean
  * 是否显示文字进度；
  * 默认值：`true`。

* **`hasHref`**：boolean
  * 各个块是否有链接（决定是a标签还是div标签）。
  * 默认值：`true`。

* **`length`**: number
  * 总项目数。

* **`complete`**: number
  * 已完成项目数。

## 方法

* **`addScale(name, title, href)`**
  * 向对象中添加一个待处理项目（小方框）。
  * **参数**
    * `name`: 用于标记该项目的名字，应当独一无二。
    * `title`: 该项目方框元素的`title`属性，缺省且`hasHref !== false`时从`name`继承。
    * `href`: 该项目方框元素的`href`属性，仅在`hasHref !== false`时有效，缺省时从`name`继承。

* **`removeScale(...name)`**
  * 移除指定的待处理项目。
  * **参数**
    * `name`: 项目的名字，用于指定要移除的项目。可以输入多个项目。

* **`crawl(name, state)`**
  * 改变某个项目的状态，状态会通过更改`data-scale-state`属性影响其显示效果。
  * 可以设置为其他值并自行编写对应的CSS。
  * **参数**
    * `name`: 项目的名字，用指定要改变状态的项目。
    * `state`: 目标状态，可以自由设置，其中为以下值时有预置样式：
      * `ready`：等待就绪
      * `ongoing`：进行中
      * `warn`：出现警告
      * `successs`：成功
      * `fail`: 失败

* **`clear()`**
  * 清空对象中的项目。