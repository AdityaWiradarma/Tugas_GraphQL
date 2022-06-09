const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql')
const app = express()

const authors = [
	{ id: 1, name: 'Andrea Hirata' },
	{ id: 2, name: 'Raditya Dika' },
	{ id: 3, name: 'Ahmad Fuadi' },
  { id: 4, name: 'Ilana Tan' }
]

const novels = [
	{ id: 1, name: 'Laskar Pelangi', authorId: 1 },
	{ id: 2, name: 'Sang Pemimpi', authorId: 1 },
	{ id: 3, name: 'Kambing Jantan: Sebuah Catatan Harian Pelajar Bodoh', authorId: 2 },
	{ id: 4, name: 'Manusia Setengah Salmon', authorId: 2 },
	{ id: 5, name: 'Negeri 5 Menara', authorId: 3 },
	{ id: 6, name: 'Ranah 3 Warna', authorId: 3 },
	{ id: 7, name: 'Sunshine Becomes You', authorId: 4 },
	{ id: 8, name: 'Winter in Tokyo', authorId: 4 }
]

const NovelType = new GraphQLObjectType({
  name: 'Novel',
  description: 'This represents a novel written by an author',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (novel) => {
        return authors.find(author => author.id === novel.authorId)
      }
    }
  })
})

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents a author of a novel',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    novels: {
      type: new GraphQLList(NovelType),
      resolve: (author) => {
        return novels.filter(novel => novel.authorId === author.id)
      }
    }
  })
})

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    novel: {
      type: NovelType,
      description: 'A Single Novel',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => novels.find(novel => novel.id === args.id)
    },
    novels: {
      type: new GraphQLList(NovelType),
      description: 'List of All Novels',
      resolve: () => novels
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'List of All Authors',
      resolve: () => authors
    },
    author: {
      type: AuthorType,
      description: 'A Single Author',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => authors.find(author => author.id === args.id)
    }
  })
})

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addNovel: {
      type: NovelType,
      description: 'Add a novel',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const novel = { id: novels.length + 1, name: args.name, authorId: args.authorId }
        novels.push(novel)
        return novel
      }
    },
    addAuthor: {
      type: AuthorType,
      description: 'Add an author',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const author = { id: authors.length + 1, name: args.name }
        authors.push(author)
        return author
      }
    }
  })
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
  schema: schema,
  graphiql: true
}))
app.listen(5000, () => console.log('Server Running'))