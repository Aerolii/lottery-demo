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

	// Box-Muller 变换生成正态分布随机数
	private normalRandom(mean: number, stdDev: number): number {
		const u1 = Math.random()
		const u2 = Math.random()
		const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
		return mean + stdDev * z
	}

	// 改进的抽取算法
	draw(count: number): string[] {
		if (this.pool.length === 0) {
			this.reset()
		}

		this.pool = this.shuffleArray(this.pool)

		const result: string[] = []
		const poolSize = this.pool.length

		for (let i = 0; i < count; i++) {
			// 使用正态分布生成索引，确保更均匀的分布
			const normalIndex = Math.abs(
				this.normalRandom(poolSize / 2, poolSize / 6)
			)
			const index = Math.min(Math.floor(normalIndex), this.pool.length - 1)
			const number = this.pool.splice(index, 1)[0]
			result.push(number)
			this.drawnNumbers.push(number)
		}

		this.saveToStorage()
		return result
	}

	reset() {
		// 先创建有序数组，然后打乱
		this.pool = this.shuffleArray(
			Array.from({ length: 75 }, (_, i) => String(i + 1).padStart(3, '0'))
		)
		this.drawnNumbers = []
		this.saveToStorage()
	}

	// Fisher-Yates 洗牌算法
	private shuffleArray(array: string[]): string[] {
		const shuffled = [...array]
		for (let i = shuffled.length - 1; i > 0; i--) {
			// 使用 crypto API 生成更随机的数
			const array = new Uint32Array(1)
			window.crypto.getRandomValues(array)
			const j = array[0] % (i + 1)
			;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
		}
		return shuffled
	}

	private saveToStorage() {
		sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.pool))
		sessionStorage.setItem(this.DRAWN_KEY, JSON.stringify(this.drawnNumbers))
	}

	getStatus(): {
		remainingCount: number
		drawnCount: number
		remainingNumbers: string[]
		drawnNumbers: string[]
	} {
		return {
			remainingCount: this.pool.length,
			drawnCount: this.drawnNumbers.length,
			remainingNumbers: [...this.pool],
			drawnNumbers: [...this.drawnNumbers],
		}
	}

	redraw(startIndex: number, count: number): string[] {
		// 直接从当前池中抽取新数字
		const result = this.draw(count)

		// 更新已抽取数组中的指定位置
		this.drawnNumbers.splice(startIndex, count, ...result)

		this.saveToStorage()
		return result
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
