# ealing-schools

A quick hack to allow me to view Ealing high schools and their intake radius with data from 2019-2021

Preview https://schools.roxb.in

## Your own data? 

Modify schools.js

```
const schoolsList = [ 
    {
        name: 'Ada Lovelace CofE High School',
        shortName: 'Ada Lovelace',
        intakeDist: { "2019": 0.749,  "2020": 0.885, "2021": 0.726 },
        visible: true, rating: 'good',
        centre: {lat: 51.5194566, lng: -0.2976813},
        description: '', 
        website: 'https://adalovelace.org.uk/', 
        colour: '#008f91'
    },
    ...
    }
```

```
 name: name shown on slide out menu
 shortName: name shown on map
 intakeDist: object "keyed" by year with intake disant in miles - null = all students admitted - 0 = no students admitted
 visible: whether to show on map by default
 rating: ofted rating
 centre: school location
 description: shown on dialog
 website: shown on dialog
 color: indicator colour used for school
```

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
