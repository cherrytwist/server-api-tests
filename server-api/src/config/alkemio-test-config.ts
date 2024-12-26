export interface AlkemioTestConfig {
  registerUsers: boolean;
  endPoints: {
    server: string;
    cluster: {
      http: string;
      ws: string;
      rest: string;
    };
    mailSlurper:  string;
    graphql: {
      private: string;
      public: string;
    }
    kratos: {
      public: string;
      private: string;
    };
  };
  identities: {
    admin: {
      email: string;
      password: string;
    };
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}
