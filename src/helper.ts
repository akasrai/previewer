import { Context } from 'probot';

interface Reviewers {
  reviewers: Array<string>;
}

interface Checklists {
  checklists: Array<string>;
}

export const isEmpty = (value: any) => {
  return (
    value === '' ||
    value === null ||
    value === undefined ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0)
  );
};

export const review = (comment: string = '') => {
  return {
    isValid: isEmpty(comment) ? true : false,
    comment,
  };
};

export const getReviewers = async (context: Context) => {
  const config: Reviewers | null = await context.config('previewer.yml');

  return config?.reviewers || [];
};

const getChecklists = async (context: Context) => {
  const config: Checklists | null = await context.config('previewer.yml');

  return config?.checklists || [];
};

export const validatePR = async (context: Context) => {
  const title = context.payload.pull_request.title;

  let comment = '';

  const titleReview = reviewPRTitle(title);

  if (!titleReview.isValid) {
    comment = titleReview.comment;
  }

  const checkListReview = await reviewChecklists(context);

  if (!checkListReview.isValid) {
    comment = `${comment}\n - *Looks like you haven't reviewed your PR. Please review and update the following checklist.*\n${checkListReview.comment}`;
  }

  return review(comment);
};

const reviewPRTitle = (title: string) => {
  if (!/[A-Z]+-[0-9]+ [a-zA-Z]+:\s+([a-zA-Z]+( [a-zA-Z]+)+)/.test(title)) {
    const comment = `- *PR title format is incorrect. Please reformat the title as in example below.*\n**CI-1555 Transfapay: Integrate OAuth bank widget**\n`;

    return review(comment);
  }

  return review();
};

const reviewMCOption = (input: string, checklist: string) => {
  let unchecked = true;
  const options = checklist.split('|');
  const title = options.shift();

  options.every((option: string) => {
    const regex = new RegExp(`(- \\[[ ]\\].+${option})`);

    if (input.match(regex) === null) {
      unchecked = false;

      return false;
    }

    return true;
  });

  if (unchecked) {
    return `Please update the **${title}**\n`;
  }

  return '';
};

const reviewChecklists = async (context: Context) => {
  let count = 0;
  let comment = '';
  const checklists = await getChecklists(context);
  const body = context.payload.pull_request.body;

  checklists.forEach((checklist: string) => {
    if (checklist.includes('|')) {
      const optionReview = reviewMCOption(body, checklist);

      if (!isEmpty(optionReview)) {
        count++;
        comment = `${comment}     ${count}. ${optionReview}`;
      }
    } else {
      const regex = new RegExp(`(- \\[[ ]\\].+${checklist})`);

      if (body.match(regex) !== null) {
        count++;
        comment = `${comment}     ${count}. ${checklist}\n`;
      }
    }
  });

  return review(comment);
};
