import { asyncOperationDemo } from '../main.js'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('asyncOperationDemo function', () => {
  let originalConsoleError
  let originalConsoleLog

  beforeEach(() => {
    // Зберігаємо та мокуємо методи console
    originalConsoleError = console.error
    originalConsoleLog = console.log
    console.error = vi.fn()
    console.log = vi.fn()

    // Використовуємо фейкові таймери для коректної емуляції асинхронності
    vi.useFakeTimers()
  })

  it('executes async calls in the expected order', async () => {
    const callback = vi.fn()
    // Спеціальні змінні для відстеження порядку викликів
    const callOrder = []
    
    // Перевизначаємо callback для відстеження порядку викликів
    const trackedCallback = (operation) => {
      callOrder.push(operation)
      callback(operation)
    }

    asyncOperationDemo(trackedCallback)

    // Перевіряємо синхронні виклики
    expect(console.log).toHaveBeenCalledWith('Перший виклик')
    expect(console.log).toHaveBeenCalledWith('Останній виклик')

    // Запускаємо асинхронні операції в правильному порядку
    // Спочатку всі nextTick
    await vi.runAllTicks()
    
    // Потім запускаємо всі мікротаски (включаючи promises) і таймери
    await vi.runAllTimersAsync()
    
    // Перевіряємо всі очікувані виклики console.log
    expect(console.log).toHaveBeenCalledWith('Виконано nextTick')
    expect(console.log).toHaveBeenCalledWith('Виконано setImmediate')
    expect(console.log).toHaveBeenCalledWith('Виконано setTimeout')
    
    // Перевіряємо, що callback був викликаний з правильними аргументами
    expect(callback).toHaveBeenCalledWith('nextTick')
    expect(callback).toHaveBeenCalledWith('setImmediate')
    expect(callback).toHaveBeenCalledWith('setTimeout')
    
    // Перевіряємо точний порядок викликів
    expect(callOrder).toEqual(['nextTick', 'setImmediate', 'setTimeout'])
    expect(callback).toHaveBeenCalledTimes(3)
  })

  afterEach(() => {
    // Відновлюємо оригінальні методи console і таймери
    console.error = originalConsoleError
    console.log = originalConsoleLog
    
    vi.useRealTimers()
  })
})
