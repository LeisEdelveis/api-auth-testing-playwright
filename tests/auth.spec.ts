import { expect, test } from '@playwright/test'
import { Login } from '../dto/login-dto'

let loginDto: Login
const baseUrl = 'https://backend.tallinn-learning.ee'
const loginEndpoint = '/login/student'
const ordersEndpoint = '/orders'
const incorrectLogin = new Login(
  'Kwa',
  'terriblepassword'
)


test.describe.serial('Authorization flow', () => {
  test.beforeAll(() => {
    loginDto = new Login(
      process.env['DL_USERNAME']!,
      process.env['DL_PASSWORD']!,
    )
  })

  test('should login and receive authorization token', async ({ request }) => {
    const response = await request.post(baseUrl + loginEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      data: loginDto,
    })

    expect(response.status()).toBe(200)
    const token = await response.text()
    console.log('Received token:', token)
    expect(token).toBeTruthy()
  })

  test('should get orders with authorization token', async ({ request }) => {
    const loginResponse = await request.post(baseUrl + loginEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      data: loginDto,
    })

    expect(loginResponse.status()).toBe(200)
    const token = await loginResponse.text()
    expect(token).toBeTruthy()

    const response = await request.get(baseUrl + ordersEndpoint, {
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    })

    expect(response.status()).toBe(200)
    const orders = await response.json()
    console.log('Orders:', JSON.stringify(orders, null, 2))
    expect(orders).toBeTruthy()
  })

  test('should not recieve a token', async ({ request }) => {
    const response = await request.post(baseUrl + loginEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      data: incorrectLogin,
    })

    expect(response.status()).toBe(401)
    const token = await response.text()
    console.log('Received token:', token)
    expect(token).toBeFalsy()
  })

})
