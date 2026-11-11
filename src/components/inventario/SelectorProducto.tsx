import { useMemo, useState } from 'react'
import { CATALOGO_PRODUCTOS, normalizarNombreCatalogo } from '../../lib/inventario/catalogoProductos'

/** All new items use a predefined name; free text is only a filter. */
export default function SelectorProducto({value,onChange}:{value:string;onChange:(nombre:string)=>void}) {
  const [busqueda,setBusqueda]=useState('')
  const categorias=useMemo(()=>Object.entries(CATALOGO_PRODUCTOS)
    .map(([categoria,productos])=>({
      categoria,
      productos: productos.filter(p=>normalizarNombreCatalogo(p).includes(normalizarNombreCatalogo(busqueda))),
    })).filter(g=>g.productos.length),[busqueda])
  return <div style={{display:'grid',gap:7}}>
    <label>Buscar producto en el catálogo
      <input type="search" value={busqueda} onChange={e=>setBusqueda(e.target.value)}
        placeholder="Ej.: lechuga, pollo, huevos…" aria-label="Filtrar catálogo de productos"/>
    </label>
    <label>Producto estandarizado
      <select required value={value} onChange={e=>onChange(e.target.value)}>
        <option value="">Selecciona un producto</option>
        {categorias.map(grupo=><optgroup label={grupo.categoria} key={grupo.categoria}>
          {grupo.productos.map(nombre=><option key={nombre} value={nombre}>{nombre}</option>)}
        </optgroup>)}
        {value && !categorias.some(g=>g.productos.includes(value as never)) &&
          <option value={value}>{value} (seleccionado)</option>}
      </select>
    </label>
    <p style={{fontSize:12,color:'var(--txt2)',margin:0}}>
      La cantidad y la unidad se eligen aparte. Así no se crean entradas distintas como «ensalada» y «ensalada 150 g».
    </p>
  </div>
}
