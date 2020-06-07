import React, { useEffect,useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft} from 'react-icons/fi';
import { Map, TileLayer, Marker} from 'react-leaflet';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../services/api';

import Dropzone from '../../components/Dropzone';

import './styles.css';

import logo from '../../assets/logo.svg';

// Array ou objeto: manualmente informar o tipo da variavel

interface Item {
    id: number,
    title: string,
    image_url: string
}
interface IBGEUFResponse {
    sigla: string;
}
interface IBGECITYResponse{
    nome: string;
}

const CreatePoint = () =>{
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);

    const [formData, setFormData] = useState({
        name : '',
        email: '',
        whatsapp: '',
    })

    const [selectedUf, setSelectUf] = useState('0');
    const [selectedCity, setSelectCity] = useState('0');
    const [selectedItems, setSelectItems] = useState<number[]>([]);
    const [selectedPosition, setSelectPosition] = useState<[number, number]>([0,0]);
    const [selectedFile, setSelectedFile] = useState<File>();

    const history = useHistory();

    useEffect(() =>{
        navigator.geolocation.getCurrentPosition(position =>{
            const {latitude, longitude } = position.coords;

            setInitialPosition([latitude,longitude]);
        });
    }, [])

    useEffect(() => {
        api.get('items').then(response =>{
            setItems(response.data);
        })
    }, []);

    useEffect(() =>{
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados/').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla)
            setUfs(ufInitials);
        })
    }, [])

    useEffect(() =>{
        //Carregar a UF quando o usuario selecionar a UF
        if(selectedUf === '0'){
            return;
        }
        axios.get<IBGECITYResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
            const citynames = response.data.map(ciry => ciry.nome)
            setCities(citynames);
        })
    }, [selectedUf])

    function handleSelectUf(event : ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;

        setSelectUf(uf);
    }

    function handleSelectCity(event : ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;

        setSelectCity(city);
    }

    function handleMapOnclick(event : LeafletMouseEvent){
        console.log(event.latlng)
        setSelectPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const{name, value} = event.target;

        setFormData({
            ...formData, [name] : value
        })
    }

    function handleSelectItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if(alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id);

            setSelectItems(filteredItems);
        }else{
            setSelectItems([...selectedItems, id ]);
        }

        
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault();

        console.log(selectedFile);

        const {name , email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] =  selectedPosition;
        const items = selectedItems;

        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude',String(longitude));
        data.append('items', items.join(','));
        if(selectedFile){
            data.append('image', selectedFile)
        }

        /*
        const data = {
            name, 
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        };
        */

        await api.post('points', data);

        alert('Ponto de coleta criado!');

        history.push('/')
    }

    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para Home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> Ponto de Coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da Entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o Endereço no Mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapOnclick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition}/>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                value={selectedUf} 
                                onChange={handleSelectUf}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf} >{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectCity}
                                >
                                <option value="0">Selecione uma Cidade</option>
                                {cities.map(city =>(
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de Coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} 
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}    
                            >
                                <img src={item.image_url} alt = {item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                        
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar Ponto de Coleta
                </button>
            </form>

        </div>

    )
}

export default CreatePoint;