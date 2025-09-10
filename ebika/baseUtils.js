
import {Config} from './config.js'

export class BaseUtils extends Config {
    
    test(params = {}, options = {}) {
        return this.constructor._runClassTest(this, params, options);
      }
    
      static test(params = {}, options = {}) {
        return this._runClassTest(this, params, options);
      }
    
      static _runClassTest(target, allParams = {}, options = { onlyProvided: false }) {
        const isClass = typeof target === 'function';
        const instance = isClass ? null : target;
        const constructor = isClass ? target : target.constructor;
    
        const methodNames = Object.getOwnPropertyNames(
          isClass ? constructor : constructor.prototype
        ).filter(
          (name) =>
            typeof (isClass ? constructor[name] : constructor.prototype[name]) === "function" &&
            name !== "constructor" &&
            name !== "test" &&
            name !== "_runClassTest"
        );
    
        const output = {
          className: constructor.name,
          targetType: isClass ? "class" : "instance",
          results: []
        };
    
        const methodsToRun = options.onlyProvided
          ? Object.keys(allParams).filter(method => methodNames.includes(method))
          : methodNames;
    
        for (const method of methodsToRun) {
          const fn = isClass ? constructor[method] : instance[method];
          const params = allParams[method] || {};
          let result = null;
          let error = null;
    
          try {
            result = fn.call(instance || constructor, params);
          } catch (err) {
            error = err.message;
          }
    
          output.results.push({
            method,
            input: params,
            output: error ? null : result,
            error
          });
        }
    
        return output;
      }

    methGenArray(method, params = {}, length) {
        return this.constructor._methGenArray(this,method, params, length);
    }
    
    static methGenArray(method, params = {}, length) {
        return this._methGenArray(this, method, params, length);
    }

    static _methGenArray(classinstance, method, params = {}, length) {
         
        let array = [];
    
        for (let i = 0; i < length; i++) {
            array.push(classinstance[method]( params));
        }
    
        return array;
    }



    static  stepsValues(  method ,params) {

      let out = [];

      for (let i= 0;i <=params.segCount; i ++) {
        params.step = i;
       out.push(  this[method](params));
    
      }
      return  out;
    }

  

  }
  