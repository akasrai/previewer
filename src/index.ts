import { Probot } from 'probot';
import { requestPRReview, reviewPR, reviewPROnEdit } from './services';

export = (app: Probot) => {
  app.on('pull_request.opened', (context) => {
    if (context.isBot) {
      return;
    }

    requestPRReview(context);
    reviewPR(context);
  });

  app.on('pull_request.reopened', (context) => {
    if (context.isBot) {
      return;
    }

    requestPRReview(context);
    reviewPR(context);
  });

  app.on('pull_request.edited', (context) => {
    if (context.isBot) {
      return;
    }

    reviewPROnEdit(context);
  });
};
