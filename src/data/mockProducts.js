import remera from "../assets/catalogo/remera.webp"
import remeraPuesta from "../assets/catalogo/remeraEnNino.webp"
import buzo from "../assets/catalogo/buzo.webp"
import buzoPuesto from "../assets/catalogo/buzoConNina.webp"
import pantalon from "../assets/catalogo/pantalon.webp"
import pantalonPuesto from "../assets/catalogo/pantalonConNino.webp"
import mochila from "../assets/catalogo/mochila.webp"
import mochilaPuesta from "../assets/catalogo/mochilaNino.webp"

export const products = [
    {
        id: "remera",
        type: "product",
        name: "Remera",
        description: "Remera naranja con logo.",
        price: 865660,
        talles: ["1", "2", "3", "4", "5"],
        image: {
                producto: remera,
                puesta: remeraPuesta,
            },
        stock: 999,
        active: true,
    },
    {
        id: "pantalon",
        type: "product",
        name: "Pantalón",
        description: "Pantalón azul.",
        price: 12500,
        talles: ["1", "2", "3", "4", "5"],
        image: {
                producto: pantalon,
                puesta: pantalonPuesto,
            },
        stock: 999,
        active: true,
    },
    {
        id: "buzo",
        type: "product",
        name: "Buzo",
        description: "Buzo azul con logo en naranja.",
        price: 16500,
        talles: ["1", "2", "3", "4", "5"], 
        image: {
                producto: buzo,
                puesta: buzoPuesto,
            },
        stock: 999,
        active: true,
    },
    {
        id: "mochila",
        type: "product",
        name: "Mochila",
        description: "Mochila azul con logo en naranja.",
        price: 18000,
        talles: ["Único"],
        image: {
                producto: mochila,
                puesta: mochilaPuesta,
            },
        stock: 999,
        active: true,
    },
];
