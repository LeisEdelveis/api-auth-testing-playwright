import { expect, test } from '@playwright/test'
import { Login } from '../dto/login-dto'
import { fetchJwt} from '../helpers/api-helper'
import{createOrder} from '../helpers/api-helper'


let loginDto: Login
export const baseUrl = 'https://backend.tallinn-learning.ee'
export const loginEndpoint = '/login/student'
export const ordersEndpoint = '/orders'
export const incorrectLogin = new Login('Kwa', 'terriblepassword')

test.describe.serial('Authorization flow', () => {
  test.beforeAll(() => {
    loginDto = new Login(process.env['DL_USERNAME']!, process.env['DL_PASSWORD']!)
  })

  test('should login and receive authorization token', async ({ request }) => {
    const token = await fetchJwt(request, loginDto)
    expect(token).toBeDefined()
  })

  test('should create an order', async ({ request }) => {
    const token = await fetchJwt(request, loginDto)
    const orderId =  await createOrder(request, token)
    expect(orderId).toBeDefined()
  })


  test('should get orders with authorization token', async ({ request }) => {
    const token = await fetchJwt(request, loginDto)

    const response = await request.get(baseUrl + ordersEndpoint, {
    headers: {
    accept: '*/*',
    Authorization: `Bearer ${token}`,
    }
  })
  expect(response. status()). toBe(200)
  const orders = await response.json()
  console.log('Orders:', JSON. stringify(orders, null, 2))
  expect(orders). toBeTruthy()
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

  test('should not get orders without authorization token', async ({ request }) => {
    const response = await request.get(baseUrl + ordersEndpoint, {
      headers: {
        accept: '*/*',
      },
    })
    expect(response.status()).toBe(401)
  })
})
