import {
	ArticleParser,
	CNNRule
} from '../index'

let rule = new CNNRule()
let parser = new ArticleParser(rule, 'https://edition.cnn.com/2019/01/13/politics/donald-trump-russia-jeanine/index.html')
parser.parse().then((article) => {
	console.log(article.title)
	console.log('words: ', article.wordCount())
	console.log(article.display)
})