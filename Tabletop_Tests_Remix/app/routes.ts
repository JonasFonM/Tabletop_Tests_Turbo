import { form, get, route } from 'remix/routes'

export const routes = route({
  assets: get('/assets/*path'),
  home: '/',
  tests: {
    show: get("/tests/:testId"),
    edit: form("/tests/:testId/edit")
  },
})
