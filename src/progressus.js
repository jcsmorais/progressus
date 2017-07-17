/*
 * Copyright (c) 2017 João Morais under the MIT license.
 * https://github.com/jcsmorais/progressus
 */

class Progressus {
    init(selector, options) {
        this.container = this.initContainer(selector);

        let containerDependencies = this.initContainerDependencies();
        [this.progressElement, this.textElement, this.valueElement] = containerDependencies;

        this.initContainerDependenciesEventListeners();

        options = options || {};

        this.max = this.initMax(options.max || 1);
        this.start = this.initStart(options.value || 0);

        this.formatter = this.initFormatter(options.formatter || this.defaultFormatter);

        if (options.text) {
            this.setText(options.text);
        }

        this.setValue(0);

        return this;
    }

    initContainer(selector) {
        if (!selector || selector.length === 0) {
            throw new Error('Invalid selector given');
        }

        let container = document.querySelector(selector);
        if (!container) {
            throw new Error(`No matches found for given selector: ${selector}`);
        }

        return container;
    }

    initContainerDependencies() {
        if (this.container.hasChildNodes()) {
            return this.initContainerExistingDependencies();
        }

        return this.createContainerDependencies();
    }

    initContainerExistingDependencies() {
        let dependencies = [];
        let dependenciesClasses = this.getContainerDependenciesClasses();
        Object.keys(dependenciesClasses).map((dependencyClass) => {
            let element = this.container.getElementsByClassName(dependencyClass)[0];
            let required = dependenciesClasses[dependencyClass];

            if (required && !element) {
                throw new Error(`Failed to initialize container, required dependency not found: ${dependencyClass}`);
            }

            dependencies.push(element);
        });

        return dependencies;
    }

    createContainerDependencies() {
        let dependencies = [];
        let dependenciesClasses = this.getContainerDependenciesClasses();
        Object.keys(dependenciesClasses).map((dependencyClass) => {
            let element = document.createElement('div');
            element.className = dependencyClass;

            dependencies.push(element);

            this.container.appendChild(element);
        });

        return dependencies;
    }

    getContainerDependenciesClasses() {
        return {
            'progress-bar-progress': true,
            'progress-bar-text': false,
            'progress-bar-value': false,
        };
    }

    initContainerDependenciesEventListeners() {
        this.container.addEventListener('progressus:progress:change', this.progressChangeHandler.bind(this));
        this.container.addEventListener('progressus:value:change', this.valueChangeHandler.bind(this));
        this.container.addEventListener('progressus:text:change', this.textChangeHandler.bind(this));
    }

    progressChangeHandler(event) {
        let percentage = event.detail.percentage;

        this.progressElement.style.width = `${percentage}%`;
    }

    valueChangeHandler(event) {
        let value = event.detail.value;
        let percentage = this.calcPercentage(value);

        if (this.valueElement) {
            this.valueElement.innerText = this.formatter({
                value: value,
                max: this.max,
                percentage: percentage,
            });
        }

        this.setProgress(percentage);
    }

    textChangeHandler(event) {
        if (!this.textElement) {
            return;
        }

        this.textElement.innerText = event.detail.text;
    }

    initMax(max) {
        let number = parseInt(max, 10);
        if (isNaN(number) || number <= 0) {
            throw new Error(`Failed to initialize max, given value is invalid: ${max}`);
        }

        return number;
    }

    initStart(value) {
        let number = parseFloat(value, 10);
        if (isNaN(number) || number < 0 || number > this.max) {
            throw new Error(`Failed to initialize starting value, given value is invalid: ${value}`);
        }

        return number;
    }

    initFormatter(formatter) {
        if (formatter && typeof formatter !== 'function') {
            throw new Error(`Failed to initialize formatter, given formatter is not a function: ${typeof formatter}`);
        }

        return formatter;
    }

    defaultFormatter(iteration) {
        if (typeof iteration !== 'object') {
            throw new Error(`Failed to apply default format, given iteration is not an object: ${typeof iteration}`);
        }

        return `${iteration.percentage}%`;
    }

    calcPercentage(value) {
        let number = parseFloat(value, 10);
        if (isNaN(number) || number < 0 || number > this.max) {
            throw new Error(`Failed to calculate percentage, given value is invalid: ${value}`);
        }

        let percentage = Math.round((number / this.max * 100));

        return percentage;
    }

    setProgress(percentage) {
        let number = parseFloat(percentage, 10);
        if (isNaN(number) || number < 0 || number > 100) {
            throw new Error(`Failed to set progress bar progress, given percentage is invalid: ${percentage}`);
        }

        let event = new CustomEvent('progressus:progress:change', { detail: { percentage: number } });
        this.container.dispatchEvent(event);
    }

    setValue(value) {
        let number = parseFloat(value, 10);
        let sum = number + this.start;
        if (isNaN(number) || number < 0 || sum > this.max) {
            throw new Error(`Failed to set progress bar value, given value is invalid: ${value}`);
        }

        let event = new CustomEvent('progressus:value:change', { detail: { value: sum } });
        this.container.dispatchEvent(event);
    }

    setText(text) {
        let event = new CustomEvent('progressus:text:change', { detail: { text: text } });
        this.container.dispatchEvent(event);
    }
}

module.exports = Progressus;
