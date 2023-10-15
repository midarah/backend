// import {NextFunction} from 'express'
import multer from "multer";
import path from "path";
import multerS3 from "multer-s3";
import aws from "@aws-sdk/client-s3";

// Destino do Store Image
const storageTypes: {
	[key: string]: multer.StorageEngine;
} = {
	local: multer.diskStorage({
		destination: (req, file, cb) => {
			let folder = "";

			if (req.baseUrl.includes("users")) {
				folder = "users";
			} else if (req.baseUrl.includes("hentais")) {
				folder = "hentais";
			} else if (req.baseUrl.includes("mangakas")) {
				folder = "mangakas";
			} else if (req.baseUrl.includes("tags")) {
				folder = "tags";
			} else if (req.baseUrl.includes("chapters")) {
				folder = "chapters";
			}

			cb(null, `public/images/${folder}`);
		},
		filename: (req, file, cb) => {
			cb(
				null,
				Date.now() +
					String(Math.floor(Math.random() * 1000)) +
					path.extname(file.originalname)
			);
		},
	}),
	S3: multerS3({
		s3: new aws.S3(),
		bucket: "midara-images",
		contentType: multerS3.AUTO_CONTENT_TYPE,
		acl: "public-read",
		key: (req, file, cb) => {
			cb(
				null,
				Date.now() +
					String(Math.floor(Math.random() * 1000)) +
					path.extname(file.originalname)
			);
		},
	}),
};

const storageType = process.env.STORAGE_TYPE || "S3";

const imageUpload = multer({
	storage: storageTypes[storageType],
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
	fileFilter: (req, file, cb) => {
		if (!file.originalname.match(/\.(png|jpg)$/)) {
			return cb(
				new Error("Por favor envie somente imagens em jpg ou png!")
			);
		}
		cb(null, true);
	},
});

export { imageUpload };
