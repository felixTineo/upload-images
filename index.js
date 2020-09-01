const { ApolloServer, gql } = require('apollo-server');
const { PrismaClient } = require('@prisma/client');
const AWS = require('aws-sdk');

const BUCKET_NAME = "archivos-clasihome-bucket";
const ACCESS_KEY_ID = "AKIA4PAZDLMKLOCJYTG4";
const SECRET_ACCESS_KEY ="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";

const s3Bucket = new AWS.S3({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
});

const createKey = (officeId, filename) => "clasihome-test" + "/" + officeId + "/" + filename;

const uploadToS3 = async({ createReadStream, officeId, filename, mimetype })=> {
  try{
    const Body = createReadStream();
    const params = {
      Bucket: BUCKET_NAME,
      Key: createKey(officeId, filename),
      Body,
      ContentEncoding: 'base64',
      //ACL: "public-read", /*DBERIA FUNCIONAR, HACER EL ARCHIVO DE LECTURA PUBLICA, PERO NO LO HACE, ASI QUE SE REQUIRE VER EN AMAZON O HACER EL BUCKET PUBLICO EN LAS POLITICAS DEL MISMO*/
      ContentType: mimetype,
    }
    const { Location: url, Key: key } = await s3Bucket.upload(params).promise();
    console.log("SEUPLOAD FUNCTION", url, key)
    return { url, key };
  }catch(e){
    console.log("ERROR UPLOAD", e);
  }
} 

const prisma = new PrismaClient();

const typeDefs = gql`
  input PropertyInput{
    title: String!
    value: Float!
    image: Upload!
  }

  type Query{
    properties:[Property!]
  }

  type Mutation{
    addProperty(input: PropertyInput):Property
  }

  type Property{
    id: ID!
    title: String!
    value: Float!
    image: File!
  }

  type File{
    id: ID!
    key: String!
    url: String!
    mimetype: String!
    name: String!
  }
`
const resolvers = {
  Query:{
    properties: async(parent, args, context, info) => {
      console.log(prisma);
      return prisma.property.findMany();
    }
  },
  Mutation:{
    addProperty: async(parent, args, context, info) => {
      const { title, value, image } = args.input;
      const { createReadStream, filename, mimetype  } = await image;
      const s3Imput = { createReadStream, filename, mimetype, officeId: "1234568" }
      const { url, key } = await uploadToS3(s3Imput);
      console.log("ADDPROPERTY RESOLVER",url, key);
      const result = await prisma.property.create({
        data:{
          title,
          value,
          image:{
            create:{
              key,
              url,
              mimetype,
              name: filename,
            }
          }
        }
      });
      
      console.log("RESULT", result);
      const foo = {
        id:"123456",
        title,
        value,
        image: {
          id: "123456",
          key,
          url,
          mimetype,
          name: filename,
        }
      }

      return result;
    }
  },
  Property:{
    image: (parent, args, context, info) => {
      return prisma.property.findOne({ where: { id: parent.id } }).image();
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => console.log(`Server listen on ${url}`));