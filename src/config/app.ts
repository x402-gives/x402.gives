type AppConfigType = {
  name: string;
  github: {
    title: string;
    url: string;
  };
  author: {
    name: string;
    url: string;
  };
};

export const appConfig: AppConfigType = {
  name: "x402.gives",
  github: {
    title: "x402.gives",
    url: "https://github.com/x402-gives/x402.gives",
  },
  author: {
    name: "x402.gives",
    url: "https://github.com/x402-gives/",
  },
};

export const baseUrl = "https://x402.gives";
