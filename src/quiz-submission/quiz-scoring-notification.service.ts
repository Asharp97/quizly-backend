import { ConsumerService } from 'src/kafka/consumer.service';

export async function processQuizSubmission(consumerService: ConsumerService) {
  await consumerService.consume(
    { topics: ['quiz.scored'] },
    {
      eachMessage: async ({ message }) => {
        const event = JSON.parse(message.value?.toString() || '{}');

        console.log(
          `[Consumer] Quiz scored event received: ${event.quizSubmissionId} - Score: ${event.percentage.toFixed(2)}%`,
        );
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate async processing
        // Here you could trigger notifications, update leaderboards, etc.
      },
    },
  );
}
