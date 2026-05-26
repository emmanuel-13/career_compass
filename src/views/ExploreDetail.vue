<!-- In the Educational Requirements section, use career.requirements -->
<div class="mb-6" v-if="career.requirements">
    <h3 class="font-semibold text-lg mb-2">{{ career.requirements.examSystem || getExamSystem(userStore.currentUser?.country) }}</h3>
    <p class="text-gray-600 mb-3">{{ career.requirements.examDescription }}</p>
    <div class="flex flex-wrap gap-2">
        <span v-for="subject in career.requirements.examSubjects" :key="subject" 
              class="px-3 py-1 rounded-lg border border-gray-200 text-sm bg-blue-50 text-blue-700">
            {{ subject }}
        </span>
    </div>
</div>

<!-- In the Salary section, use career.salary -->
<div class="bg-indigo-50 rounded-2xl p-6">
    <h2 class="font-bold mb-3">💰 Salary Range ({{ userStore.currentUser?.country || 'International' }})</h2>
    <div class="space-y-2">
        <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Entry Level:</span>
            <span class="font-semibold text-indigo-700">{{ formatSalaryEntry(career.salary) }}</span>
        </div>
        <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Mid Level:</span>
            <span class="font-semibold text-indigo-700">{{ formatSalaryMid(career.salary) }}</span>
        </div>
        <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Senior Level:</span>
            <span class="font-semibold text-indigo-700">{{ formatSalarySenior(career.salary) }}</span>
        </div>
    </div>
</div>

<!-- In the Top Universities section, use career.universities -->
<div class="grid md:grid-cols-2 gap-4">
    <div v-for="(uni, idx) in career.universities?.slice(0, 10)" :key="uni.name" class="p-4 border rounded-xl hover:shadow-md transition">
        <div class="flex items-start gap-3">
            <div class="text-indigo-600 font-bold text-lg">{{ idx + 1 }}</div>
            <div>
                <h3 class="font-bold text-indigo-600">{{ uni.name }}</h3>
                <p class="text-sm text-gray-500">{{ uni.ranking }}</p>
                <p class="text-sm text-gray-700">{{ uni.programName }}</p>
            </div>
        </div>
    </div>
</div>
