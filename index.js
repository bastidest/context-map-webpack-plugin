const ContextElementDependency = require("webpack/lib/dependencies/ContextElementDependency");
class ContextMapPlugin {

  constructor(context, staticDependencies) {
    this.context = context;
    this.staticDependencies = staticDependencies;
  }

  apply(compiler) {
    compiler.hooks.contextModuleFactory.tap('ContextMapPlugin', (cmf) => {
      cmf.hooks.beforeResolve.tap('ContextMapPlugin', (result) => {
        if(result.context.endsWith(this.context)) {
          result.resolveDependencies = (fs, options, callback) => {
            const dependencies = this.staticDependencies.map((sd) => new ContextElementDependency(sd, sd));
            for (const d of result.dependencies) {
	      if (d.critical) d.critical = false;
	    }
            callback(null, dependencies);
          };
        }
      });
    });
  }
}

module.exports = ContextMapPlugin;
