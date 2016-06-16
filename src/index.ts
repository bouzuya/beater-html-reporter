import { Reporter, Test, TestResult } from 'beater-reporter';

type HtmlString = string;

const escapeHtml = (html: HtmlString): string => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
};

const ensureRootElement = (): Element => {
  const id = 'beater';
  const e = document.getElementById(id);
  if (e) return e;
  const root = document.createElement('ul');
  root.setAttribute('id', id);
  document.body.appendChild(root);
  return root;
};

const log = (html: HtmlString): void => {
  const root = ensureRootElement();
  const li = document.createElement('li');
  li.innerHTML = html;
  root.appendChild(li);
};

const failure = (html: HtmlString): HtmlString => {
  return `<span style="color: #ff0000">${escapeHtml(html)}</span>`;
};

const success = (html: HtmlString): HtmlString => {
  return `<span style="color: #00ff00">${escapeHtml(html)}</span>`;
};

const v = '\u2713'; // U+2713 CHECK MARK
const x = '\u2717'; // U+2717 BALLOT X

class BeaterHtmlReporter implements Reporter {
  started(): void {
    // do nothing
  }

  finished(results: TestResult[]): void {
    const passed = results.filter(({ error }) => !!!error);
    const failed = results.filter(({ error }) => !!error);

    failed.forEach(({ test, error: { name, message } }) => {
      log([
        `${failure(x + ' failure: ')}${test.name}`,
        `${name}: ${message}`
      ].join('<br />'));
    });

    const summary = failed.length > 0
      ? failure(x + ` ${failed.length} of ${results.length} tests failed`)
      : success(v + ` ${results.length} tests passed`);
    log(summary);
  }

  testStarted(_: Test): void {
    // do nothing
  }

  testFinished(result: TestResult): void {
    if (!!result.error) return;
    log(`${success(v + ' success: ')}${result.test.name}`);
  }
}

export default function (): Reporter {
  return new BeaterHtmlReporter();
}
