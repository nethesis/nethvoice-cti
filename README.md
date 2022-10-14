## Scaffolding

- **components** - contains the reusable components
  - The components are divided in subdirectories by macrosection, for example:
    - history
    - layout
    - login
    - operators
    - phonebook
    - common
    - settings
- **config** - contains the configuration files for the app
  - Build and project configuration are in the root directory of the project
- **lib** - contains functions that can be extracted from components
  - The files are divided by context, for example:
    - login.ts
    - notification.ts
    - operators.ts
    - phonebook.ts
    - websocket.ts
    - util.ts
- **pages** - contains all the pages of the application
  - There is a file for every app route, check the [Next.js routing docs](https://nextjs.org/docs/routing/introduction) for more info
- **models** - contains the models used by rematch
  - Check the [rematch models docs](https://rematchjs.org/docs/api-reference/models) for more info
- **public** - contains the static files
- **store** - contains the stores for rematch
  - Check the [rematch store docs](https://rematchjs.org/docs/api-reference/store) for more info
- **styles** - contains the styling files
- **theme** - contains classes used by the common components

## Tools

The project is initialized using [**Next.js**](https://nextjs.org/) with [**Typescript**](https://www.typescriptlang.org/) and uses [**Tailwind CSS**](https://tailwindcss.com/) for the design.

## Libraries

- [**rematch**](https://rematchjs.org/) & [**react-redux**](https://react-redux.js.org/) - for the management of the shared state between components
- [**axios**](https://axios-http.com/docs/intro) - for the http requests
- [**janus-gateway**](https://janus.conf.meetecho.com/docs/JS.html) - for comunication with the WebRTC server
- [**socket.io**](https://socket.io/) - for web socket connections

## Development
Requirements
- Node.js 12.22.0 or later

Install dependencies
```
npm install
```

Run locally in development mode:
```
npm run dev
```

Build locally:
```
npm run build
```

Start locally:
```
npm start
```

_Other command could be available in package.json scripts._

## Development Tools

To ensure a good development experince the following extensions are recommended for vscode:

- [TypeScrypt](https://code.visualstudio.com/docs/languages/typescript)
- [IntelliCode](https://marketplace.visualstudio.com/items?itemName=VisualStudioExptTeam.vscodeintellicode)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Deployment

The project can be deployed through containers.

Requirements

- [podman](https://podman.io/) or [docker](https://docs.docker.com/)

Create the container image:

```
podman build .
```
_It returns the image_id._

Run the container:

```
podman run -dt -p 3001:3000/tcp <image_id>
```
_If port 3001 is already in use, replace it with a free one._

The project will be available on localhost:3001