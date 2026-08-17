import "i18next";

declare module "i18next" {
  interface CustomTypeOptions {
    // The instance is initialized with `returnNull: false`, so `t()` always
    // resolves to a string and can be passed straight into string props.
    returnNull: false;
  }
}
