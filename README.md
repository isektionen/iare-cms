# iare-cms

CMS &amp; backend API for content delivering


iare-cms is built on top of the popular headless CMS [strapi.js](https://strapi.io), which allows us to create API & GraphQL endpoints very quickly for a fast and agile development enviroment.

It's fully built with javascript and is 100% customizable, meaning that we can extend it with in-house built plugins for future endeavours..

## Roadmap

- [ ] Build an Event Managing plugin
  - [x] Design event collections
    - [x] Add datetime validation
    - [x] Add tickets container (multiple tickets)
    - [x] Add optional serving options (Food / bewerage)
    - [x] Add optional student options (Class year / Program)
    - [x] Add optional password protection
  - [ ] Design information-flow
  - [ ] Restrict access to managing events under RBAC
    - [x] Admin
    - [ ] Through API calls
    - [ ] Handle edgecases
      - [ ] When committee doesn't exist
      - [ ] When event doesn't exist
  - [x] Design UI for administrator
- [ ] Explain key concepts of Strapi
  - [ ] Quick-start guide (on top of the provided one)
  - [ ] API
  - [ ] Graphql
  - [ ] Plugin
  - [ ] Lifecycles
  - [ ] Relations
- [ ] Setup user permissions
  - [ ] Design a detailed RBAC protocol
  - [ ] Design necessary roles
  - [ ] Setup security tests for each role
- [ ] Hook up CMS with payment-backend
  - [ ] Build payment-backend (Python)
  - [ ] Connect it with payment-provider
  - [ ] Build webhooks between backends

## Technologies under the hood

- Koa.js - Koa is a new web framework designed by the team behind Express
- React.js - A JavaScript library for building user interfaces
- Buffet.js - A component library built for strapi
- Redux - A state container for Javascript Applications
  
## Plugin specific technologies

- Recoil.js - A dependency graph state management library for React
- React-icons - An extensive library for icons
- Echarts - An extensive SVG chart library