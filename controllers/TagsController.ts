import { Request, Response } from "express";
import { TagsModel } from "../models/TagsModel.js";
import aws from "@aws-sdk/client-s3";
import { DeleteObjectCommandOutput } from "@aws-sdk/client-s3";

const s3 = new aws.S3();

// Helpers
import getToken from "../helpers/get-token.js";
import getUserByToken from "../helpers/get-user-by-token.js";
import { isValidObjectId } from "mongoose";

class TagsController {
	static async create(req: Request, res: Response) {
		const { tagName, definition } = req.body;

		// Upload de imagem
		let image = "";

		// Configuração do Req File para que o filename seja igual a key (Local e AWS S3)
		if (req.file) {
			if ("key" in req.file) {
				// Estamos usando o armazenamento S3
				if (typeof req.file.key === "string") {
					image = req.file.key;
				}
			} else {
				// Estamos usando o armazenamento local
				if (typeof req.file.filename === "string") {
					image = req.file.filename;
				}
			}
		}

		// Validações
		if (!tagName) {
			res.status(422).json({ message: "O nome da tag é obrigatório!" });
			return;
		}

		const tagExist = await TagsModel.findOne({ tagName: tagName });

		if (tagExist) {
			res.status(422).json({ message: "Tag já cadastradas!" });
			return;
		}

		if (!definition) {
			res.status(422).json({
				message: "A definição da tag é obrigatória!",
			});
			return;
		}

		// Pegar o Administrador responsável pelo cadastro da Tag
		const token: any = getToken(req);
		const user = await getUserByToken(token);

		if (!user) {
			res.status(401).json({ message: "Usuário não encontrado!" });
			return;
		}

		if (!image) {
			res.status(422).json({ message: "A imagem é obrigatória!" });
			return;
		}

		const tag = new TagsModel({
			tagName: tagName,
			definition: definition,
			image,
		});

		try {
			const newTag = await tag.save();

			res.status(200).json({
				message: "Tag cadastrada com sucesso",
				newTag,
			});
		} catch (err) {
			res.status(500).json({ message: err });
		}
	}

	static async getAllTags(req: Request, res: Response) {
		const tags = await TagsModel.find().sort({ tagName: 1 });

		res.status(200).json({ tags });
	}

	static async getTagById(req: Request, res: Response) {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			res.status(422).json({ message: "ID inválido!" });
			return;
		}

		// Verificar se a Tag existe
		const tag = await TagsModel.findOne({ _id: id });

		if (!tag) {
			res.status(404).json({ message: "Tag não encontrada" });
		}

		res.status(200).json({ tag });
	}

	static async deleteTag(req: Request, res: Response) {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			res.status(422).json({ message: "ID inválido!" });
			return;
		}

		// Pegar o Administrador responsável pelo cadastro da Tag
		const token: any = getToken(req);
		const user = await getUserByToken(token);

		if (!user) {
			res.status(401).json({ message: "Usuário não encontrado!" });
			return;
		}

		try {
			// Verificar se a Tag existe
			const tag = await TagsModel.findOne({ _id: id });

			if (!tag) {
				res.status(404).json({ message: "Tag não encontrada" });
				return;
			}

			if (tag && tag.image) {
				// Nome do bucket e chave do objeto que você deseja excluir
				const bucketName = "midara-images";
				const objectImage = tag.image;

				// Parâmetros para a exclusão
				const params = {
					Bucket: bucketName,
					Key: objectImage,
				};

				// Excluir o objeto no S3
				s3.deleteObject(
					params,
					(err: any, data?: DeleteObjectCommandOutput) => {
						if (err) {
							console.error("Erro ao excluir imagem:", err);
						} else {
							console.log(
								"Imagem excluída da AWS S3 com sucesso!!"
							);
						}
					}
				);
			}

			await TagsModel.findByIdAndRemove(tag);

			res.status(200).json({ message: "Tag Deletada com sucesso" });
			return;
		} catch (err) {
			console.log(err);
		}
	}
}

export default TagsController;
