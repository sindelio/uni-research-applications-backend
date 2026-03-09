import jsonWebToken from 'jsonwebtoken';

const {
  USER_EMAIL,
  USER_PASSWORD,
  USER_NAME,
  JWT_SECRET,
} = process.env;

const USER = {
  email: USER_EMAIL,
  password: USER_PASSWORD,
  name: USER_NAME,
  company: 'TalentSourcery',
  status: 'Email confirmed',
  apiToken: '0123456789abcef',
  billing: {
    plan: 'Pay ahead',
    credits: 5,
    stripeCustomerId: '***',
  },
  createdAt: {
    readableDate: 'Thu, 29 Dec 2022 17:48:38 GMT',
    isoDate: '2022-12-29T17:48:38.318Z',
  },
  lastUpdatedAt: {
    readableDate: 'Thu, 29 Dec 2022 19:44:39 GMT',
    isoDate: '2022-12-29T19:44:39.323Z',
  },
  _id: '63add2f678a81575a0627f8f',
  __v: 0,
};

const CREDENTIALS = {
  email: USER_EMAIL,
  password: USER_PASSWORD,
};

const JWT_OPTIONS = {
  algorithm: 'HS256',
  expiresIn: '24h',
};

const JWT = await jsonWebToken.sign(CREDENTIALS, JWT_SECRET, JWT_OPTIONS);

const SEARCH = {
  email: USER_EMAIL,
  userName: USER_NAME,
  source: 'GitHub',
  searchName: 'Test',
  searchString: 'location:"São Paulo" language:JavaScript repos:1..50 followers:>1',
  searchForm: {
    searchName: 'Test',
    location: 'São Paulo',
    language: 'JavaScript',
    repos: '1..50',
    followers: '>1',
    sort: 'Most recently joined',
  },
  talentInfo: {
    csv: 'Name,Email in profile,Email in commits,Hireable,Handle,GitHub profile,Company,Location,Bio,Website,Public repositories,Public gists,Followers,Following,Twitter,Date of creation (yyyy-mm-dd),\nMateus V. Farias,    me@mateusfarias.com.br,    -,    true,    fariasmateuss,    https://github.com/fariasmateuss,    -,    São Paulo; SP; Brazil,    I\'m Software engineer based in Brazil. Frontend dev is my focus; but always up for learning new things.,    mateusfarias.com.br,    36,    3,    974,    1817,    fariasmateuss,    2019-09-23\nFelipe Silva Aguiar,    -,    felipe.silva.aguiar047@gmail.com,    -,    felipeAguiarCode,    https://github.com/felipeAguiarCode,    @digitalinnovationone,    São paulo - SP; Brazil,    Software Consultant developer #asp.net #csharp #typescript #nodejs,    https://www.youtube.com/channel/UCkXrg36Iacg1lPIDXZrTDbQ/videos,    37,    -,    1528,    13,    -,    2018-03-16\nLuis Henrique Bizarro,    luis@bizar.ro,    luis@activetheory.net,    true,    bizarro,    https://github.com/bizarro,     Apple,    São Paulo; Brazil,    Creative Technologist at  Apple. Awwwards Independent of The Year. WebGL; GLSL and JavaScript.,    https://read.cv/bizarro/,    10,    -,    1107,    139,    bizar_ro,    2015-06-10\nCelso Henrique,    celso.henrique@hotmail.com.br,    celso.henrique@hotmail.com.br,    -,    celso-henrique,    https://github.com/celso-henrique,    @uber,    Brazil; São Paulo,    -,    https://celsohenrique.com,    26,    -,    1096,    64,    celsohenrique_,    2014-09-17\nLuiz Batanero,    -,    luizbatanero@gmail.com,    -,    luizbatanero,    https://github.com/luizbatanero,    @Rocketseat,    São Paulo; SP,    Full stack developer with a design background. Building cool stuff at @Rocketseat.,    http://www.luizbatanero.com,    26,    -,    1512,    47,    -,    2013-08-03\nSérgio Lopes,    -,    -,    -,    sergiolopes,    https://github.com/sergiolopes,    Alura,    São Paulo; Brazil,    CTO no Grupo Alura,    http://sergiolopes.org,    43,    50,    1539,    3,    sergio_caelum,    2009-06-02\n',
    json: [
      {
        name: 'Mateus V. Farias',
        emailInProfile: 'me@mateusfarias.com.br',
        emailInCommits: '-',
        hireable: true,
        handle: 'fariasmateuss',
        url: 'https://github.com/fariasmateuss',
        company: '-',
        location: 'São Paulo; SP; Brazil',
        bio: 'I\'m Software engineer based in Brazil. Frontend dev is my focus; but always up for learning new things.',
        website: 'mateusfarias.com.br',
        publicRepos: 36,
        publicGists: 3,
        followers: 974,
        following: 1817,
        twitter: 'fariasmateuss',
        createdAt: '2019-09-23',
      },
      {
        name: 'Felipe Silva Aguiar',
        emailInProfile: '-',
        emailInCommits: 'felipe.silva.aguiar047@gmail.com',
        hireable: '-',
        handle: 'felipeAguiarCode',
        url: 'https://github.com/felipeAguiarCode',
        company: '@digitalinnovationone',
        location: 'São paulo - SP; Brazil',
        bio: 'Software Consultant developer #asp.net #csharp #typescript #nodejs',
        website: 'https://www.youtube.com/channel/UCkXrg36Iacg1lPIDXZrTDbQ/videos',
        publicRepos: 37,
        publicGists: '-',
        followers: 1528,
        following: 13,
        twitter: '-',
        createdAt: '2018-03-16',
      },
    ],
  },
  numberOfPeopleSourced: 2,
  createdAt: {
    readableDate: 'Fri, 06 Jan 2023 22:27:52 GMT',
    isoDate: '2023-01-06T22:27:52.055Z',
  },
  _id: '63b8a0688f5ab7eecf0a2240',
  __v: 0,
};

const PURCHASE = {
  email: USER_EMAIL,
  createdAt: {
    readableDate: 'Fri, 06 Jan 2023 22:27:52 GMT',
    isoDate: '2023-01-06T22:27:52.055Z',
  },
  amount: '500 USD',
  quantity: 10,
  receiptUrl: 'https://stripe.com',
  _id: '63add2f678a81575a0627f8f',
  __v: 0,
};

export {
  USER,
  CREDENTIALS,
  JWT,
  SEARCH,
  PURCHASE,
};
