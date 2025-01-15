export class LotteryPool {
	private pool: string[] = []
	private drawnNumbers: string[] = []
	private readonly STORAGE_KEY = 'lottery_pool'
	private readonly DRAWN_KEY = 'drawn_numbers'

	constructor() {
		const savedPool = sessionStorage.getItem(this.STORAGE_KEY)
		const savedDrawn = sessionStorage.getItem(this.DRAWN_KEY)

		if (savedPool && savedDrawn) {
			this.pool = JSON.parse(savedPool)
			this.drawnNumbers = JSON.parse(savedDrawn)
		} else {
			this.reset()
		}
	}

	draw(count: number): string[] {
		if (this.pool.length === 0) {
			this.reset()
		}

		const drawCount = Math.min(count, this.pool.length)
		const result: string[] = []

		for (let i = 0; i < drawCount; i++) {
			const index = Math.floor(Math.random() * this.pool.length)
			const number = this.pool.splice(index, 1)[0]
			result.push(number)
			this.drawnNumbers.push(number)
		}

		this.saveToStorage()
		return result
	}

	reset() {
		this.pool = Array.from({ length: 75 }, (_, i) =>
			String(i + 1).padStart(3, '0')
		)
		this.drawnNumbers = []
		this.saveToStorage()
	}

	private saveToStorage() {
		sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.pool))
		sessionStorage.setItem(this.DRAWN_KEY, JSON.stringify(this.drawnNumbers))
	}

	getStatus() {
		return {
			remainingCount: this.pool.length,
			drawnCount: this.drawnNumbers.length,
			remainingNumbers: [...this.pool],
			drawnNumbers: [...this.drawnNumbers],
		}
	}
}

export class LotteryAnimation {
	private isRunning = false
	private animationFrames: number[] = []
	private finalNumbers: string[] = []

	start(count: number, callback: (nums: string[]) => void) {
		this.isRunning = true
		this.finalNumbers = []

		const animate = () => {
			if (!this.isRunning) return

			const randomNums = Array(count)
				.fill(0)
				.map((_, index) => {
					if (this.finalNumbers[index]) {
						return this.finalNumbers[index]
					}
					return String(Math.floor(Math.random() * 75) + 1).padStart(3, '0')
				})

			callback(randomNums)

			setTimeout(() => {
				this.animationFrames.push(requestAnimationFrame(animate))
			}, 50)
		}

		animate()
	}

	stop(finalNumbers: string[], callback: (nums: string[]) => void) {
		this.isRunning = false
		this.finalNumbers = finalNumbers
		this.animationFrames.forEach((frame) => cancelAnimationFrame(frame))
		this.animationFrames = []

		let startTime = performance.now()
		const duration = 1000 // 1秒

		const animate = (currentTime: number) => {
			const elapsed = currentTime - startTime
			const progress = Math.min(elapsed / duration, 1)

			if (progress < 1) {
				callback(finalNumbers)
				requestAnimationFrame(animate)
			} else {
				callback(finalNumbers)
			}
		}

		requestAnimationFrame(animate)
	}
}

// 正确使用示例
const animation = new LotteryAnimation()
const displayNumbers = { value: [] as string[] }

animation.start(10, (nums) => {
	displayNumbers.value = nums
})

const finalNumbers = [
	'001',
	'002',
	'003',
	'004',
	'005',
	'006',
	'007',
	'008',
	'009',
	'010',
]
animation.stop(finalNumbers, (nums) => {
	displayNumbers.value = nums
})
