import fetch from "node-fetch";

export class ArticleParser {
  constructor(public rule: Rule, public url: string, public article: Article) {}

  async parse(): Promise<Article> {
    const html = await this.fetchHTML();
    const nodetree = this.parseToNodeTree(html);
    this.article = this.rule.parse(nodetree);
    return this.article;
  }

  private async fetchHTML(): Promise<string> {
    const res = await fetch(this.url);
    if (res.ok) {
      return await res.text();
    } else {
      throw new Error("bad status");
    }
  }

  private parseToNodeTree(html: string): DocumentFragment {
    const frag = document.createDocumentFragment();
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    frag.appendChild(tmp);
    return frag;
  }
}

abstract class Rule {
  abstract parse(nodetree: DocumentFragment): Article;

  getTitle(nodetree: DocumentFragment): string {
    const titleEl = nodetree.querySelector("title");
    if (!titleEl) {
      throw new Error("invalid page. title doesn't exist");
    }
    return titleEl.innerText;
  }
}

export class CNNRule extends Rule {
  static sitename: string = "CNN";
  static selector: string = ".article-container .article-content p";

  parse(nodetree: DocumentFragment): Article {
    const title = this.getTitle(nodetree);
    const article = new Article(title);

    nodetree
      .querySelectorAll<HTMLElement>(CNNRule.selector)
      .forEach((paragraph, _idx: number) => {
        article.paragraphs.push(new Paragraph(paragraph.innerText));
      });

    return article;
  }
}

class Article {
  constructor(public title: string, public paragraphs: Paragraph[] = []) {}

  wordCount(): number {
    return this.paragraphs.reduce((sum, p) => sum + p.wordCount(), 0);
  }

  display(): string {
    return this.paragraphs.map(p => p.body).join("\n\n");
  }
}

class Paragraph {
  public words: string[] = [];
  constructor(public body: string) {
    this.words = body.split(" ").filter((word: string) => word !== "");
  }

  wordCount(): number {
    return this.words.length;
  }
}
