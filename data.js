/* Prototype-only sample catalogue. Source of truth will move to secure cloud storage later.
 * Image URLs are external candidate US cover art, NOT verified/approved production assets.
 */
window.GV = {
  platforms: [
    {id:'ps5',label:'PlayStation 5',short:'PS5',color:'#627cfa',accent:'#b4c1ff'},
    {id:'switch2',label:'Nintendo Switch 2',short:'Switch 2',color:'#ed5a59',accent:'#ffc7c4'},
    {id:'switch',label:'Nintendo Switch / OLED',short:'Switch',color:'#ef5057',accent:'#ffc3c5'},
    {id:'pc',label:'PC (Windows)',short:'PC',color:'#4bbec4',accent:'#b7f3ec'},
    {id:'ps4',label:'PlayStation 4',short:'PS4',color:'#5877ed',accent:'#b4c5ff'}
  ],
  catalog: [
    {key:'requiem',title:'Resident Evil Requiem',year:2026,publisher:'Capcom',developer:'Capcom',genre:'Survival Horror',platforms:['ps5','switch2','pc'],editions:['Standard Edition','Deluxe Edition'],cover:'https://cdn.awsli.com.br/2500x2500/524/524499/produto/393079173/resident-evil-requiem-ps5-deluxe-edition-steelbook-us-site-mixdjdqay2.jpg',source:'https://store.playstation.com/en-us/product/UP0102-PPSA30803_00-REREQUIEMDX00000/'},
    {key:'gtavi',title:'Grand Theft Auto VI',year:2026,publisher:'Rockstar Games',developer:'Rockstar Games',genre:'Action / Adventure',platforms:['ps5'],editions:['Standard Edition','Ultimate Edition'],cover:'https://manabigames.org/img/juego/game_6a3cb7ec9586d.jpg',source:'https://store.playstation.com/en-us/product/EP1004-PPSA01547_00-GTAVIULTIMATE001/'},
    {key:'spider2',title:"Marvel’s Spider-Man 2",year:2023,publisher:'Sony Interactive Entertainment',developer:'Insomniac Games',genre:'Action / Adventure',platforms:['ps5','pc'],editions:['Standard Edition','Digital Deluxe Edition'],cover:'https://icuracao.com/cdn/shop/files/1_08F-B10-1000038005_66be56d6a62fb.jpg?v=1728091722',source:'https://www.playstation.com/en-us/games/marvels-spider-man-2/'},
    {key:'miles',title:"Marvel’s Spider-Man: Miles Morales",year:2020,publisher:'Sony Interactive Entertainment',developer:'Insomniac Games',genre:'Action / Adventure',platforms:['ps5','ps4','pc'],editions:['Standard Edition','Ultimate Edition'],cover:'https://media.falabella.com/falabellaCO/10002792_1/public',source:'https://www.playstation.com/en-us/games/marvels-spider-man-miles-morales/'},
    {key:'astro',title:'ASTRO BOT',year:2024,publisher:'Sony Interactive Entertainment',developer:'Team Asobi',genre:'Platformer',platforms:['ps5'],editions:['Standard Edition','Digital Deluxe Edition'],cover:'https://i5.walmartimages.com/asr/afe6cde0-e4ee-4c5d-9223-26ab7a316d5b.8542e339a11ad795934729a2cb89de0d.jpeg',source:'https://www.playstation.com/en-us/games/astro-bot/'},
    {key:'minecraft',title:'Minecraft',year:2018,publisher:'Mojang Studios',developer:'Mojang Studios',genre:'Sandbox / Survival',platforms:['switch','ps5','ps4','pc'],editions:['Standard Edition'],cover:'https://target.scene7.com/is/image/Target/GUEST_b8e62edd-79d7-4771-89d7-8d122f241252',source:'https://www.nintendo.com/us/store/products/minecraft-106679/'},
    {key:'smash',title:'Super Smash Bros. Ultimate',year:2018,publisher:'Nintendo',developer:'Bandai Namco Studios / Sora Ltd.',genre:'Fighting',platforms:['switch'],editions:['Standard Edition'],cover:'https://americanas.vtexassets.com/arquivos/ids/25077739/3924864431_1_xlarge.jpg?v=638755444547430000',source:'https://www.nintendo.com/us/store/products/super-smash-bros-ultimate-switch/'},
    {key:'spider-remastered',title:"Marvel’s Spider-Man Remastered",year:2020,publisher:'Sony Interactive Entertainment',developer:'Insomniac Games',genre:'Action / Adventure',platforms:['ps5','pc'],editions:['Standard Edition'],cover:'',source:'https://www.playstation.com/en-us/games/marvels-spider-man-remastered/'},
    {key:'zelda-totk',title:'The Legend of Zelda: Tears of the Kingdom',year:2023,publisher:'Nintendo',developer:'Nintendo EPD',genre:'Action / Adventure',platforms:['switch','switch2'],editions:['Standard Edition','Nintendo Switch 2 Edition'],cover:'',source:''},
    {key:'mario-odyssey',title:'Super Mario Odyssey',year:2017,publisher:'Nintendo',developer:'Nintendo EPD',genre:'Platformer',platforms:['switch'],editions:['Standard Edition'],cover:'',source:''}
  ],
  // IMPORTANT: do not commit a private inventory to a public GitHub Pages repository.
  initial: []
};
