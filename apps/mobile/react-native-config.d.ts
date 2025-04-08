declare module 'react-native-config' {
  export type NativeConfig = {
    API_HOST?: string;
    ENVIRONMENT?: string;
  };

  export const Config: NativeConfig;
  export default Config;
}
