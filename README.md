<h1 align="center">🎯 Vessel Tracker API</h1>

## About

Vessel Tracker API for for track 🚢 vessels and ⚓ ports around the world.

<a href="https://github.com/thiagotrs/vessel-tracker/">Check the Web Application (UI)</a>


## Technologies

- Node JS
- Typescript
- Clean Architecture

## Run Project

### Clone Project

```git
git clone https://github.com/thiagotrs/vessel-tracker-api.git
```

### API

```shell
cd vessel-tracker-api
npm install
npm start
```

## Configuration

Create 'development.env' file in the root directory with these variables:

```
APP_PORT = 4000
APP_HOST = localhost

JWT_SECRET = super-secret
JWT_EXPIRES_IN = 3600

TYPEORM_CONNECTION = sqlite
TYPEORM_DATABASE = "./src/infra/data/database.sqlite"
TYPEORM_ENTITIES = "./src/**/*Entity.ts"
TYPEORM_MIGRATIONS = "./src/infra/data/migrations/*.ts"
TYPEORM_MIGRATIONS_DIR = "./src/infra/data/migrations"
```

### URLs

```
http://localhost:4000/
```

## Author

Thiago Rotondo Sampaio - [GitHub](https://github.com/thiagotrs) / [Linkedin](https://www.linkedin.com/in/thiago-rotondo-sampaio) / [Email](mailto:thiagorot@gmail.com)

## License

This project use MIT license, see the file [LICENSE](./LICENSE.md) for more details

---

<p align="center">Develop by <a href="https://github.com/thiagotrs">Thiago Rotondo Sampaio</a></p>