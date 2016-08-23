## 简介

> npm包的软链接

## 背景

在用`react`的时候总是需要全家桶，什么`babel` `webpack`等，差不多一个项目的`node_modules`就要
`100M`以上，然后在想在每个项目能不能复用`babel`和`webpack`等公用库，
还有就刚好了解了linux`软链接`的功能，想了想是不是可以结合两者来做一个库的软链接呢。

每一个项目的`node_modules`的库基本都是软链接公用node_modules的，功能基本不会丢失，
每一个库都是软链接的大小。

## 使用

1. 安装
> npm install -g npm-ln

2. 配置
在 config.js 里面配置 `INSTALLED_PATH`，这个是公用库的路径；
`NODE_MODULES_PATH`这个是安装到项目的哪个位置，默认是安装到
`node_modules`；

3. 命令
	* `npm-ln install` 包名；
	* `npm-ln install` 会在`package.json`里面找并安装依赖；
	* `npm-ln install --save`

