<template>
    <section>

        <!-- Progress -->
        <div class="mb-8">
            <div class="flex items-center justify-between mb-3">

                <span class="text-sm font-medium text-gray-700">
                    Question {{ questionIndex }}
                </span>

                <span class="text-sm font-medium text-indigo-600">
                    {{ barWidth }}
                </span>
            </div>

            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    class="h-full bg-indigo-600 transition-all duration-300 ease-out"
                    :style="{ width: barWidth }"
                ></div>
            </div>
        </div>

        <!-- Question Card -->
        <div
            v-if="question"
            class="text-card-foreground flex flex-col gap-6 p-8 md:p-10 border border-gray-200 bg-white rounded-2xl mb-8 shadow-sm"
        >

            <!-- Question -->
            <h2 class="text-2xl font-bold mb-8 text-gray-900 leading-snug">
                {{ question.text }}
            </h2>

            <!-- Options -->
            <div class="space-y-3">

                <button
                    v-for="option in question.options"
                    :key="option.id"
                    @click="selectOption(option)"
                    :class="[
                        'w-full p-5 rounded-xl border-2 text-left transition-all',

                        selectedOption?.id === option.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    ]"
                >

                    <div class="flex items-center gap-3">

                        <!-- Radio -->
                        <div
                            :class="[
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',

                                selectedOption?.id === option.id
                                ? 'border-indigo-600'
                                : 'border-gray-300'
                            ]"
                        >

                            <div
                                v-if="selectedOption?.id === option.id"
                                class="w-2.5 h-2.5 rounded-full bg-indigo-600"
                            ></div>

                        </div>

                        <!-- Text -->
                        <span class="text-base font-medium text-gray-900">
                            {{ option.text }}
                        </span>

                    </div>

                </button>

            </div>

            <!-- Error -->
            <p
                v-if="error"
                class="text-red-500 text-sm font-medium"
            >
                {{ error }}
            </p>

        </div>

        <!-- Buttons -->
        <div class="flex justify-between gap-4">

            <!-- Previous -->
            <button
                @click="previousQuestion"
                :disabled="currentQuestionIndex === 0"
                :class="[
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all px-6 h-12 text-base rounded-xl border',

                    currentQuestionIndex === 0
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-800'
                ]"
            >
                Back
            </button>

            <!-- Next -->
            <button
                v-if="!isLastQuestion"
                @click="nextQuestion"
                :disabled="!selectedOption"
                :class="[
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all px-6 h-12 text-base rounded-xl',

                    !selectedOption
                    ? 'bg-indigo-300 text-white cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                ]"
            >
                Next
            </button>

            <!-- Submit -->
            <button
                v-else
                @click="submitQuiz"
                :disabled="!selectedOption"
                :class="[
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all px-6 h-12 text-base rounded-xl',

                    !selectedOption
                    ? 'bg-indigo-300 text-white cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                ]"
            >
                Submit Now
            </button>

        </div>

        <!-- <CareerModal
            :show="showModal"
            :careers="quizStore.careers"
            @close="showModal = false"
        /> -->

    </section>
</template>

<script setup>
import {
    ref,
    computed,
    watch
} from "vue";

import { useQuizStore } from "@/stores/quiz";
import { useUserStore } from "@/stores/users";
import { useRouter } from "vue-router";

// import CareerModal from "@/components/CareerModal.vue";
const quizStore = useQuizStore();
const userStore = useUserStore();

const router = useRouter();
const currentQuestionIndex = ref(0);

const selectedOption = ref(null);

const error = ref("");
// const showModal = ref(false);

const props = defineProps({
    question: {
        type: Array,
        required: true
    }
});


// =========================
// CURRENT QUESTION
// =========================

const question = computed(() => {
    return props.question?.[
        currentQuestionIndex.value
    ] || null;
});


// =========================
// LAST QUESTION
// =========================

const isLastQuestion = computed(() => {

    return (
        currentQuestionIndex.value ===
        props.question.length - 1
    );
});


// =========================
// PROGRESS BAR
// =========================

const barWidth = computed(() => {

    const progress =
        (
            (currentQuestionIndex.value + 1)
            / props.question.length
        ) * 100;

    return progress.toFixed(0) + "%";
});


// =========================
// QUESTION NUMBER
// =========================

const questionIndex = computed(() => {

    return `${currentQuestionIndex.value + 1} of ${props.question.length}`;
});


// =========================
// RESTORE SAVED ANSWER
// =========================

watch(question, (newQuestion) => {

    if (!newQuestion) return;

    const savedAnswer =
        quizStore.getAnswer(newQuestion.id);

    if (savedAnswer) {

        const matchedOption =
            newQuestion.options.find(
                option =>
                    option.text === savedAnswer.answer
            );

        selectedOption.value =
            matchedOption || null;

    } else {

        selectedOption.value = null;
    }
},
{
    immediate: true
});


// =========================
// SELECT OPTION
// =========================

const selectOption = (option) => {

    selectedOption.value = option;

    error.value = "";

    quizStore.saveAnswer(
        question.value.id,
        option
    );
};


// =========================
// NEXT QUESTION
// =========================

const nextQuestion = () => {

    if (!selectedOption.value) {

        error.value =
            "Please select an option";

        return;
    }

    if (
        currentQuestionIndex.value <
        props.question.length - 1
    ) {

        currentQuestionIndex.value++;
        window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
    }
};


// =========================
// PREVIOUS QUESTION
// =========================

const previousQuestion = () => {
    if (
        currentQuestionIndex.value > 0
    ) {
    
        currentQuestionIndex.value--;
    
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
};


// =========================
// SUBMIT QUIZ
// =========================

// const submitQuiz = async () => {

//     await userStore.fetchCurrentUser(); // 🔥 ensure ready

//     const country = userStore.currentUser?.country;

//     if (!country) {
//         console.error("User country missing");
//         return;
//     }

//     quizStore.generateCareer(country);

//     router.push({ name: "results" });
// };


// =========================
// SUBMIT QUIZ
// =========================

const submitQuiz = async () => {

    await userStore.fetchCurrentUser(); // 🔥 ensure ready

    const country = userStore.currentUser?.country;

    if (!country) {
        console.error("User country missing");
        return;
    }

    // 🔥 ADD THIS LINE - Mark that quiz was just completed
    localStorage.setItem('quiz_just_completed', 'true');
    

    quizStore.generateCareer(country);

    router.push({ name: "results" });
};

</script>
