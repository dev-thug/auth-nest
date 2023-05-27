// src/config/configuration.ts

import * as yaml from 'js-yaml';

import { join } from 'path';
import { readFileSync } from 'fs';

const YAML_CONFIG_DEVELOPMENT = 'development.yaml';
const YAML_CONFIG_PRODUCTION = 'production.yaml';

export default () => {
  const configFile =
    process.env.NODE_ENV === 'production'
      ? YAML_CONFIG_PRODUCTION
      : YAML_CONFIG_DEVELOPMENT;

  return yaml.load(readFileSync(join(__dirname, configFile), 'utf8')) as Record<
    string,
    any
  >;
};
