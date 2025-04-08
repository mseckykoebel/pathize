import {config} from '../config';

const idDev = 'jupiter-dev-V8qfl7xuce';
const idProd = 'jupiter-V79HgwzkdT';
const idStaging = 'jupiter-staging-mv0Zz9EMCq';

export const getTerraDevID = (): string => {
  const environment = config.api.environment;

  if (environment === 'production') return idProd;
  if (environment === 'development') return idDev;
  return idStaging;
};
