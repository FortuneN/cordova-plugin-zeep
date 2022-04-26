interface Window {
  Zeep: Zeep;
}

interface ZeepConfig {
  from: string;
  to: string;
  password?: string;
}

interface Zeep {
  zip(config: ZeepConfig, successCallback?: () => void, errorCallback?: (error: string) => void): void;

  unzip(config: ZeepConfig, successCallback?: () => void, errorCallback?: (error: string) => void): void;
}

declare const Zeep: Zeep;
