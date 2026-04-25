import { getSemaphoreBalance } from './src/app/actions/sms'

async function check() {
  const result = await getSemaphoreBalance()
  console.log('--- SEMAPHORE ACCOUNT STATUS ---')
  if (result.success) {
    console.log(`Current Balance: ${result.credit_balance} Credits`)
    console.log('Status: ACTIVE')
  } else {
    console.log('Error:', result.error)
    console.log('Status: NOT CONFIGURED')
  }
  console.log('--------------------------------')
}

check()
