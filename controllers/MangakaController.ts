import { Request, Response } from "express";
import { MangakaModel } from "../models/MangakaModel.js";
import { isValidObjectId } from "mongoose";
import aws from "@aws-sdk/client-s3";
import { DeleteObjectCommandOutput } from "@aws-sdk/client-s3";

const s3 = new aws.S3();

// Helpers
import getToken from "../helpers/get-token.js";
import getUserByToken from "../helpers/get-user-by-token.js";

class MangakaController {
	static async create(req: Request, res: Response) {
		const { mangakaName, information, twitter } = req.body;

		// Upload de Imagens
		let image = "";

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
		if (!mangakaName) {
			res.status(422).json({
				message: "O nome do Mangaka é o1brigatório!",
			});
			return;
		}

		const mangakaExist = await MangakaModel.findOne({
			mangakaName: mangakaName,
		});

		if (mangakaExist) {
			res.status(422).json({ message: "Mangaka já cadastrado!" });
			return;
		}

		if (!image) {
			res.status(422).json({ message: "A imagem é obrigatória!" });
			return;
		}

		// Pegar o Administrador responsável pelo cadastro do Hentai
		const token: any = getToken(req);
		const user = await getUserByToken(token);

		if (!user) {
			res.status(401).json({ message: "Usuário não encontrado!" });
			return;
		}

		// Criar uma nova Página de Hentai
		const mangaka = new MangakaModel({
			mangakaName: mangakaName,
			information: information,
			twitter: twitter,
			image,
		});

		try {
			const newMangaka = await mangaka.save();

			res.status(200).json({
				message: "Mangaka cadastrado com sucesso!",
				newMangaka,
			});
		} catch (err) {
			res.status(500).json({ message: err });
		}
	}

	static async getAllMangakas(req: Request, res: Response) {
		const mangakas = await MangakaModel.find().sort({ mangakaName: 1 });

		res.status(200).json({ mangakas });
	}

	static async getMangakaById(req: Request, res: Response) {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			res.status(422).json({ message: "ID inválido" });
		}

		const mangaka = await MangakaModel.findOne({ _id: id });

		if (!mangaka) {
			res.status(404).json({ message: "Mangaka não encontrado" });
		}

		res.status(200).json({ mangaka });
	}

	static async deleteMangaka(req: Request, res: Response) {
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
			const mangaka = await MangakaModel.findOne({ _id: id });

			if (!mangaka) {
				res.status(404).json({ message: "Mangaka não encontrada" });
				return;
			}

			if (mangaka && mangaka.image) {
				// Nome do bucket e chave do objeto que você deseja excluir
				const bucketName = "midara-images";
				const objectImage = mangaka.image;

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
							console.log("Erro ao excluir a imagem:", err);
						} else {
							console.log(
								"Imagem excluída da AWS S3 com sucesso!"
							);
						}
					}
				);
			}

			await MangakaModel.findByIdAndRemove(mangaka);

			res.status(200).json({ message: "Mangaka Deletado com sucesso" });
			return;
		} catch (err) {
			console.log(err);
		}
	}
}

export default MangakaController;
