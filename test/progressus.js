/*
 * Copyright (c) 2017 João Morais under the MIT license.
 * https://github.com/jcsmorais/progressus
 */

let assert = require('assert');
let sinon = require('sinon');
let sandbox = sinon.sandbox.create();

let Progressus = require('../src/progressus.js');

describe('Progressus', () => {
    let p;

    beforeEach(() => {
        p = new Progressus();
    });

    afterEach(() => {
        p = null;
        sandbox.restore();
    });

    describe('init', () => {
        it('should initialize progress bar with given selector and fallback to default options if none given', () => {
            let selector = '.abc';
            let container = sandbox.stub();
            let progressElement = sandbox.stub();
            let textElement = sandbox.stub();
            let valueElement = sandbox.stub();
            let max = 1;
            let value = 0;

            sandbox.stub(p, 'initContainer')
                .withArgs(selector)
                .returns(container);

            sandbox.stub(p, 'initContainerDependencies')
                .returns([progressElement, textElement, valueElement]);

            sandbox.stub(p, 'initContainerDependenciesEventListeners');

            sandbox.stub(p, 'initMax')
                .withArgs(max)
                .returns(max);

            sandbox.stub(p, 'initStart')
                .withArgs(value)
                .returns(value);

            sandbox.stub(p, 'initFormatter')
                .withArgs(p.defaultFormatter)
                .returns(p.defaultFormatter);

            sandbox.stub(p, 'setText');

            sandbox.stub(p, 'setValue');

            assert.equal(p.init(selector), p);

            assert(p.initContainer.calledOnce);
            assert.equal(p.initContainer.getCall(0).args[0], selector);
            assert.equal(p.container, container);

            assert(p.initContainerDependencies.calledOnce);
            assert.equal(p.progressElement, progressElement);
            assert.equal(p.textElement, textElement);
            assert.equal(p.valueElement, valueElement);

            assert(p.initContainerDependenciesEventListeners.calledOnce);

            assert(p.initMax.calledOnce);
            assert.equal(p.initMax.getCall(0).args[0], max);
            assert.equal(p.max, max);

            assert(p.initStart.calledOnce);
            assert.equal(p.initStart.getCall(0).args[0], value);
            assert.equal(p.start, value);

            assert(p.initFormatter.calledOnce);
            assert.equal(p.initFormatter.getCall(0).args[0], p.defaultFormatter);
            assert.equal(p.formatter, p.defaultFormatter);

            assert.equal(p.setText.called, false);

            assert(p.setValue.calledOnce);
            assert.equal(p.setValue.getCall(0).args[0], 0);
        });

        it('should initialize progress bar with given selector and custom options', () => {
            let selector = '.abc';
            let container = sandbox.stub();
            let options = {
                text: 'Installing dependencies...',
                max: 2,
                value: 1,
                formatter: sandbox.stub(),
            };
            let progressElement = sandbox.stub();
            let textElement = sandbox.stub();
            let valueElement = sandbox.stub();

            sandbox.stub(p, 'initContainer')
                .withArgs(selector)
                .returns(container);

            sandbox.stub(p, 'initContainerDependencies')
                .returns([progressElement, textElement, valueElement]);

            sandbox.stub(p, 'initContainerDependenciesEventListeners');

            sandbox.stub(p, 'initMax')
                .withArgs(options.max)
                .returns(options.max);

            sandbox.stub(p, 'initStart')
                .withArgs(options.value)
                .returns(options.value);

            sandbox.stub(p, 'initFormatter')
                .withArgs(options.formatter)
                .returns(options.formatter);

            sandbox.stub(p, 'setText')
                .withArgs(options.text);

            sandbox.stub(p, 'setValue');

            assert.equal(p.init(selector, options), p);

            assert(p.initContainer.calledOnce);
            assert.equal(p.initContainer.getCall(0).args[0], selector);
            assert.equal(p.container, container);

            assert(p.initContainerDependencies.calledOnce);
            assert.equal(p.progressElement, progressElement);
            assert.equal(p.textElement, textElement);
            assert.equal(p.valueElement, valueElement);

            assert(p.initContainerDependenciesEventListeners.calledOnce);

            assert(p.initMax.calledOnce);
            assert.equal(p.initMax.getCall(0).args[0], options.max);
            assert.equal(p.max, options.max);

            assert(p.initStart.calledOnce);
            assert.equal(p.initStart.getCall(0).args[0], options.value);
            assert.equal(p.start, options.value);

            assert(p.initFormatter.calledOnce);
            assert.equal(p.initFormatter.getCall(0).args[0], options.formatter);
            assert.equal(p.formatter, options.formatter);

            assert(p.setText.calledOnce);
            assert.equal(p.setText.getCall(0).args[0], options.text);

            assert(p.setValue.calledOnce);
            assert.equal(p.setValue.getCall(0).args[0], 0);
        });
    });

    describe('initContainer', () => {
        it('should return DOM element based on given selector', () => {
            let existingSelector = '.abc';

            sandbox.stub(document, 'querySelector')
                .withArgs(existingSelector)
                .returns('fake-dom-element');

            assert.equal(p.initContainer(existingSelector), 'fake-dom-element');
        });

        it('should throw an error if given selector is invalid', () => {
            assert.throws(
                () => p.initContainer(''),
                /Invalid selector given/
            );
        });

        it('should throw an error if no matches found for given selector', () => {
            let nonExistingSelector = '.abc';
            let errorMsg;

            sandbox.stub(document, 'querySelector')
                .withArgs(nonExistingSelector)
                .returns(null);

            assert.throws(
                () => p.initContainer(nonExistingSelector),
                /No matches found for given selector: .abc/
            );
        });
    });

    describe('initContainerDependencies', () => {
        it('should create new dependencies if container has no children', () => {
            p.container = { hasChildNodes: sandbox.stub().returns(false) };

            sandbox.stub(p, 'initContainerExistingDependencies');
            sandbox.stub(p, 'createContainerDependencies');

            p.initContainerDependencies();

            assert.equal(p.initContainerExistingDependencies.called, false);
            assert(p.createContainerDependencies.calledOnce);
        });

        it('should use existing dependencies if container has children', () => {
            p.container = { hasChildNodes: sandbox.stub().returns(true) };

            sandbox.stub(p, 'initContainerExistingDependencies');
            sandbox.stub(p, 'createContainerDependencies');

            p.initContainerDependencies();

            assert(p.initContainerExistingDependencies.calledOnce);
            assert.equal(p.createContainerDependencies.called, false);
        });
    });

    describe('initContainerExistingDependencies', () => {
        it('should initialize existing dependencies if required constraints are met', () => {
            p.container = {
                getElementsByClassName: (className) => { return [{ className, className }]; }
            };

            sandbox.stub(p, 'getContainerDependenciesClasses').returns({
                'progress-bar-progress': true,
                'progress-bar-text': false,
                'progress-bar-value': false,
            });

            dependencies = p.initContainerExistingDependencies();
            let [progress, text, value] = dependencies;

            assert.equal(dependencies.length, 3);
            assert.equal(progress.className, 'progress-bar-progress');
            assert.equal(text.className, 'progress-bar-text');
            assert.equal(value.className, 'progress-bar-value');
        });

        it('should throw an error if any required constraint isn\'t met', () => {
            p.container = {
                getElementsByClassName: (className) => {
                    return className === 'progress-bar-progress' ? [] : [className];
                }
            };

            sandbox.stub(p, 'getContainerDependenciesClasses').returns({
                'progress-bar-progress': true,
                'progress-bar-text': false,
                'progress-bar-value': false,
            });

            assert.throws(
                () => p.initContainerExistingDependencies(),
                /Failed to initialize container, required dependency not found: progress-bar-progress/
            );
        });
    });

    describe('createContainerDependencies', () => {
        it('should create container dependencies as children', () => {
            p.container = {
                appendChild: sandbox.stub()
            };

            sandbox.stub(p, 'getContainerDependenciesClasses').returns({
                'progress-bar-progress': true,
                'progress-bar-text': false,
                'progress-bar-value': false,
            });

            sandbox.stub(document, 'createElement').callsFake((className) => { return { className: className } });

            dependencies = p.createContainerDependencies();
            let [progress, text, value] = dependencies;

            assert.equal(dependencies.length, 3);
            assert.equal(progress.className, 'progress-bar-progress');
            assert.equal(text.className, 'progress-bar-text');
            assert.equal(value.className, 'progress-bar-value');
        });
    });

    describe('getContainerDependenciesClasses', () => {
        it('should return container dependencies classes', () => {
            let classes = p.getContainerDependenciesClasses();

            assert.deepEqual(classes, {
                'progress-bar-progress': true,
                'progress-bar-text': false,
                'progress-bar-value': false,
            });
        });
    });

    describe('initContainerDependenciesEventListeners', () => {
        it('should initialize container dependencies event listeners', () => {
            p.container = { addEventListener: sandbox.stub() };

            p.initContainerDependenciesEventListeners();

            assert.ok(p.container.addEventListener.calledThrice);

            let [call0, call1, call2] = p.container.addEventListener.getCalls();

            assert.equal(call0.args[0], 'progressus:progress:change');
            assert.equal(typeof call0.args[1], 'function');
            assert.equal(call0.args[1].name, 'bound progressChangeHandler');

            assert.equal(call1.args[0], 'progressus:value:change');
            assert.equal(typeof call1.args[1], 'function');
            assert.equal(call1.args[1].name, 'bound valueChangeHandler');

            assert.equal(call2.args[0], 'progressus:text:change');
            assert.equal(typeof call2.args[1], 'function');
            assert.equal(call2.args[1].name, 'bound textChangeHandler');
        });
    });

    describe('progressChangeHandler', () => {
        it('should update progress bar progress', () => {
            p.progressElement = { style: { width: 1 } };

            let event = { detail: { percentage: 2 } };

            p.progressChangeHandler(event);

            assert.equal(p.progressElement.style.width, '2%');
        });
    });

    describe('valueChangeHandler', () => {
        it('should update progress bar value if valueElement has been initialized', () => {
            p.valueElement = { innerText: 1 };
            p.max = 4;

            let event = { detail: { value: 2 } };

            sandbox.stub(p, 'calcPercentage')
                .withArgs(2)
                .returns(50);

            p.formatter = sandbox.stub()
                .withArgs({
                    value: 2,
                    max: p.max,
                    percentage: 50,
                })
                .returns('50%');

            sandbox.stub(p, 'setProgress');

            p.valueChangeHandler(event);

            assert(p.calcPercentage.calledOnce);
            assert.equal(p.calcPercentage.getCall(0).args[0], 2);

            assert(p.formatter.calledOnce);
            assert.deepEqual(p.formatter.getCall(0).args[0], { value: 2, max: p.max, percentage: 50 });

            assert.equal(p.valueElement.innerText, '50%');

            assert(p.setProgress.calledOnce);
            assert.equal(p.setProgress.getCall(0).args[0], 50);
        });

        it('should not update progress bar value if valueElement has not been initialized', () => {
            let event = { detail: { value: 2 } };

            sandbox.stub(p, 'calcPercentage')
                .withArgs(2)
                .returns(2);

            p.formatter = sandbox.stub();

            sandbox.stub(p, 'setProgress');

            p.valueChangeHandler(event);

            assert(p.calcPercentage.calledOnce);
            assert.equal(p.calcPercentage.getCall(0).args[0], 2);

            assert.equal(p.formatter.called, false);

            assert(p.setProgress.calledOnce);
            assert.equal(p.setProgress.getCall(0).args[0], 2);
        });
    });

    describe('textChangeHandler', () => {
        it('should update progress bar text if textElement has been initialized', () => {
            p.textElement = { innerText: 'abc' };

            let event = { detail: { text: 'def' } };

            p.textChangeHandler(event);

            assert.equal(p.textElement.innerText, 'def');
        });

        it('should not update progress bar text if textElement has not been initialized', () => {
            let event = { detail: { text: 'def' } };

            p.textChangeHandler(event);

            assert.equal(p.textElement, undefined);
        });
    });

    describe('initMax', () => {
        it('should return max based on given value', () => {
            assert.equal(p.initMax(5), 5);
        });

        it('should throw an error if given value is not a number', () => {
            assert.throws(
                () => p.initMax('a'),
                /Failed to initialize max, given value is invalid: a/
            );
        });

        it('should throw an error if given value is below zero', () => {
            assert.throws(
                () => p.initMax(-1),
                /Failed to initialize max, given value is invalid: -1/
            );
        });

        it('should throw an error if given value is equal to zero', () => {
            assert.throws(
                () => p.initMax(0),
                /Failed to initialize max, given value is invalid: 0/
            );
        });
    });

    describe('initStart', () => {
        it('should return starting value based on given value', () => {
            p.max = 10;

            assert.equal(p.initStart(5), 5);
        });

        it('should throw an error if given value is not a number', () => {
            assert.throws(
                () => p.initStart('a'),
                /Failed to initialize starting value, given value is invalid: a/
            );
        });

        it('should throw an error if given value is below zero', () => {
            assert.throws(
                () => p.initStart(-1),
                /Failed to initialize starting value, given value is invalid: -1/
            );
        });

        it('should throw an error if given value is above max', () => {
            p.max = 10;

            assert.throws(
                () => p.initStart(11),
                /Failed to initialize starting value, given value is invalid: 11/
            );
        });
    });

    describe('initFormatter', () => {
        it('should return given formatter if it is a function', () => {
            let expected = sandbox.stub();

            let actual = p.initFormatter(expected);

            assert.equal(actual, expected);
        });

        it('should throw an error if given formatter is not a function', () => {
            assert.throws(
                () => p.initFormatter('not-a-function'),
                /Failed to initialize formatter, given formatter is not a function: string/
            );
        });
    });

    describe('defaultFormatter', () => {
        it('should return a string based on given iteration values according to default format', () => {
            let string = p.defaultFormatter({
                value: 1,
                max: 100,
                percentage: 1,
            });

            assert.equal(string, '1%');
        });

        it('should throw an error if given iteration is not an object', () => {
            assert.throws(
                () => p.defaultFormatter('not-an-object'),
                /Failed to apply default format, given iteration is not an object: string/
            );
        });
    });

    describe('calcPercentage', () => {
        it('should calculate percentage based on given value', () => {
            p.max = 4;
            assert.equal(p.calcPercentage(1), 25);

            p.max = 9;
            assert.equal(p.calcPercentage(3), 33);

            p.max = 12;
            assert.equal(p.calcPercentage(6.56), 55);
        });

        it('should throw an error if given value is not a number', () => {
            assert.throws(
                () => p.calcPercentage('a'),
                /Failed to calculate percentage, given value is invalid: a/
            );
        });

        it('should throw an error if given value is below zero', () => {
            assert.throws(
                () => p.calcPercentage(-1),
                /Failed to calculate percentage, given value is invalid: -1/
            );
        });

        it('should throw an error if given value is above max', () => {
            p.max = 10;

            assert.throws(
                () => p.calcPercentage(11),
                /Failed to calculate percentage, given value is invalid: 11/
            );
        });
    });

    describe('setProgress', () => {
        it('should trigger change event to update progress bar based on given percentage', () => {
            p.container = { dispatchEvent: sandbox.stub() };

            p.setProgress(1);
            p.setProgress(33.5);
            p.setProgress(100);

            assert.ok(p.container.dispatchEvent.calledThrice);

            let [call0, call1, call2] = p.container.dispatchEvent.getCalls();

            assert(call0.args[0] instanceof CustomEvent);
            assert.equal(call0.args[0].type, 'progressus:progress:change');
            assert.deepEqual(call0.args[0].detail, { percentage: 1 });

            assert(call1.args[0] instanceof CustomEvent);
            assert.equal(call1.args[0].type, 'progressus:progress:change');
            assert.deepEqual(call1.args[0].detail, { percentage: 33.5 });

            assert(call2.args[0] instanceof CustomEvent);
            assert.equal(call2.args[0].type, 'progressus:progress:change');
            assert.deepEqual(call2.args[0].detail, { percentage: 100 });
        });

        it('should throw an error if given percentage is not a number', () => {
            assert.throws(
                () => p.setProgress('a'),
                /Failed to set progress bar progress, given percentage is invalid: a/
            );
        });

        it('should throw an error if given percentage is below zero', () => {
            assert.throws(
                () => p.setProgress(-1),
                /Failed to set progress bar progress, given percentage is invalid: -1/
            );
        });

        it('should throw an error if given percentage is above a hundred', () => {
            assert.throws(
                () => p.setProgress(101),
                /Failed to set progress bar progress, given percentage is invalid: 101/
            );
        });
    });

    describe('setValue', () => {
        it('should trigger change event to update progress bar based on given value', () => {
            p.container = { dispatchEvent: sandbox.stub() };
            p.max = 10;
            p.start = 1;

            p.setValue(9)

            assert(p.container.dispatchEvent.calledOnce);

            let call0 = p.container.dispatchEvent.getCall(0);

            assert(call0.args[0] instanceof CustomEvent);
            assert.equal(call0.args[0].type, 'progressus:value:change');
            assert.deepEqual(call0.args[0].detail, { value: 10 });
        });

        it('should throw an error if given value is not a number', () => {
            assert.throws(
                () => p.setValue('a'),
                /Failed to set progress bar value, given value is invalid: a/
            );
        });

        it('should throw an error if given value is below zero', () => {
            assert.throws(
                () => p.setValue(-1),
                /Failed to set progress bar value, given value is invalid: -1/
            );
        });

        it('should throw an error if given value is above max', () => {
            p.max = 100;
            p.start = 0;

            assert.throws(
                () => p.setValue(101),
                /Failed to set progress bar value, given value is invalid: 101/
            );
        });

        it('should throw an error if the sum between value and starting value is above max', () => {
            p.max = 10;
            p.start = 11;

            assert.throws(
                () => p.setValue(11),
                /Failed to set progress bar value, given value is invalid: 11/
            );
        });
    });

    describe('setText', () => {
        it('should trigger change event to update progress bar text based on given text', () => {
            p.container = { dispatchEvent: sandbox.stub() };

            p.setText('eagle has landed');

            assert(p.container.dispatchEvent.calledOnce);

            let call0 = p.container.dispatchEvent.getCall(0);

            assert(call0.args[0] instanceof CustomEvent);
            assert.equal(call0.args[0].type, 'progressus:text:change');
            assert.deepEqual(call0.args[0].detail, { text: 'eagle has landed' });
        });
    });
});

