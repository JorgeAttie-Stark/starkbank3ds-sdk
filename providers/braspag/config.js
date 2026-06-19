const ENVIRONMENTS = {
  sandbox: {
    code: 'SDB',
    scriptUrl: 'https://mpisandbox.braspag.com.br/Scripts/BP.Mpi.3ds20.min.js'
  },
  production: {
    code: 'PRD',
    scriptUrl: 'https://mpi.braspag.com.br/Scripts/BP.Mpi.3ds20.min.js'
  }
}

export function getConfig(environment) {
  const config = ENVIRONMENTS[environment];
  if (!config) throw new Error(`Environment ${environment} not found`);
  return config;
}