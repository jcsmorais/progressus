# Progressus [![Build Status](https://travis-ci.org/jcsmorais/progressus.svg?branch=master)](https://travis-ci.org/jcsmorais/progressus) [![Coverage Status](https://coveralls.io/repos/github/jcsmorais/progressus/badge.svg?branch=master)](https://coveralls.io/github/jcsmorais/progressus?branch=master)
Yet another Progress Bar written in Javascript.

# Usage examples
* [Progress Bar with default options](https://jsfiddle.net/jcsmorais/Lzkuz6af/)
* [Progress Bar with starting value](https://jsfiddle.net/jcsmorais/5jqc3xw7/)
* [Progress Bar with custom formatter](https://jsfiddle.net/jcsmorais/7phwqjod/)
* [Progress Bar with custom style](https://jsfiddle.net/jcsmorais/3wken654/)
* [Progress Bar with custom style and animation](https://jsfiddle.net/jcsmorais/852hehrL/)

# API
| Method        | Params              | Type     | Description                                                                                                                 |
|---------------|---------------------|----------|-------------------------------------------------------------------|
| `init`        | `selector`            | `string`   | First Element within the DOM that matches given selector. |
|               | `[options]`           | `Object`   | Progress Bar options. |
|               | `[options.max]`       | `number`   | Total tasks to execute, defaults to `1` if none supplied. |
|               | `[options.value]`     | `number`   | Total of tasks completed, defaults to `0` if none supplied. |
|               | `[options.formatter]` | `Function` | Format used for progress bar text updates performed via `setText`, defaults to `${iteration.percentage}%`. Other variables available through `${iteration}` are: `${iteration.value}` and `${iteration.max}`. |
|               | `[options.text]`      | `string`   | Initialize progress bar text, defaults to none. |
| `setProgress` | `percentage`          | `number`   | Update progress bar progress, `percentage` is a number between `0` and `100`. |
| `setValue`    | `value`               | `number`   | Update progress bar value, `value` is a number between `0` and `options.max`. |
| `setText`     | `string`              | `string`   | Update progress bar text. |

# Events
| Event                        | Params                    | Type     | Description                                                                                                                 |
|------------------------------|---------------------------|----------|---------------------------------|
| `progressus:progress:change` | `event.detail.percentage` | `number` | Triggered when progress changes. |
| `progressus:value:change`    | `event.detail.value`      | `number` | Triggered when value changes. |
| `progressus:text:change`     | `event.detail.text`       | `text`   | Triggered when text changes. |
