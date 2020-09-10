export type cardFieldConfigs = {
  enabled: boolean;
  urlPath: string;
  hoverLabel?: string;
  title: string;
  imgPath?: string;
  imgAlt?: string;
  logoPath: string;
  logoAlt?: string;
};

export type cardFieldSchema = {
  fields: Array<cardFieldConfigs>;
};
