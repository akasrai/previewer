import { Context } from 'probot';

interface Reviewers {
  reviewers: Array<string>;
}

interface Checklists {
  checklists: Array<string>;
}

interface PrTitle {
  prtitle: {
    regex: string;
    example: string;
  };
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

const getPRRegex = async (context: Context) => {
  const config: PrTitle | null = await context.config('previewer.yml');

  return {
    regex: config?.prtitle.regex,
    example: config?.prtitle.example,
  };
};

export const getLabels = (context: Context): string[] => {
  const labels = context.payload.pull_request.labels;

  return labels.map((label: any) => label.name);
};

export const validatePR = async (context: Context) => {
  let comment = '';

  const titleReview = await reviewPRTitle(context);

  if (!titleReview.isValid) {
    comment = titleReview.comment;
  }

  const checkListReview = await reviewChecklists(context);

  if (!checkListReview.isValid) {
    comment = `${comment}\n - *Looks like you haven't reviewed your PR. Please review and update the following checklist.*\n${checkListReview.comment}`;
  }

  return review(comment);
};

const reviewPRTitle = async (context: Context) => {
  const { regex, example } = await getPRRegex(context);
  const validation = new RegExp(regex || '');
  const title = context.payload.pull_request.title;

  if (!validation.test(title)) {
    const comment = `- *PR title format is incorrect. Please reformat the title as in example below.*\n**${example}**\n`;

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
