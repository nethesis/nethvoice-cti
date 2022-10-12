## Scaffolding

- **components** - contains the reusable components
- **config** - contains the configuration files
- **lib** - contains functions that can be extracted from components
- **pages** - contains all the pages of the application
- **models** - contains the models used by rematch
- **store** - contains the stores for rematch
- **public** - contains the static files
- **styles** - contains the styling files

## Tools

The project is initialized using [**Next.js**](https://nextjs.org/) with [**Typescript**](https://www.typescriptlang.org/) and uses [**Tailwind CSS**](https://tailwindcss.com/) for the design.

## Libraries

- [**rematch**](https://rematchjs.org/) & [**react-redux**](https://react-redux.js.org/) - for the management of the shared state between components
- [**axios**](https://axios-http.com/docs/intro) - for the http requests
- [**janus-gateway**](https://janus.conf.meetecho.com/docs/JS.html) - for comunication with the WebRTC server
- [**socket.io**](https://socket.io/) - for web socket connections