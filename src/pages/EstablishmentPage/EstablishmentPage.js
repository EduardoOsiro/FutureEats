import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FutureEats } from '../../globalState/Context'
import { getRestaurantDetails } from '../../services/RestaurantDetails'
import { useInput } from '../../Hooks/useInput'
import * as container from './styles'
import { ProductsCard } from '../../Components/ProductsCard/ProductCard'
import { PopUpQuantity } from '../../Components/PopUpQuantity/popUp'
import Header from '../../Components/Header/Header'
import time from '../../assets/Images/time.png';
import delivery from '../../assets/Images/delivery.png';
import Footer from '../../Components/Footer/Footer'
import LoadingCompoent from '../../Components/Loading/loading'
import { useProtectPage } from '../../Hooks/useProtectedPage'

export default function EstablishmentPage() {
  const navigate = useNavigate()
  useProtectPage(navigate)
  const params = useParams();
  const detail = useContext(FutureEats)
  const [quantidade, handleQuantidade, clearInput] = useInput('')
  const [displawPopUp, setPopUp] = useState(false)
  const [productId, setProductid] = useState()
  const [Principais, setPrincipais] = useState([])
  const [Acompanhamento, setAcompanhamento] = useState([])
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => getRestaurantDetails(detail.setRestDetail, params.id, setLoading), [detail.setRestDetail])
  useEffect(() => detail.restDetail && addPropertyInCart(detail.restDetail.restaurant.products, detail.cart)
    , [detail.restDetail])

  const addPropertyInCart = (array, cart) => {

    const anotherRestaurantProduct = cart.find(e => e.id !== detail.restDetail.restaurant.id)
    anotherRestaurantProduct && detail.setCart([])
    const newState = array.map(e => {
      const alreadyInCart = cart.find(a => a.id === e.id)
      if (alreadyInCart) {
        return alreadyInCart
      } else {
        return { ...e, inCart: false, restaurantId: detail.restDetail.restaurant.id }
      }
    })
    separar(newState)
  }

  const separar = (e) => {
    const principal = []
    const acompanhamentos = []
    e.map(e => {
      if (e.category === 'Pizza' || e.category === 'Refeição' || e.category === 'Lanche' ||
        e.category === 'Pastel' || e.category === 'Salgado') {
        principal.push(e)
      } else {
        acompanhamentos.push(e)
      }
    })
    setPrincipais(principal)
    setAcompanhamento(acompanhamentos)
    setLoading(false)
  }

  const UpdateProductCard = (products) => {
    if (category === 'Principais') {
      const newPrincipal = Principais.map(e =>
        products.id === e.id ? { ...e, inCart: e.inCart ? false : true, quantity: 0 } : e)
      setPrincipais(newPrincipal)
    } else {
      const newAcompanhamento = Acompanhamento.map(e =>
        products.id === e.id ? { ...e, inCart: e.inCart ? false : true, quantity: 0 } : e)
      setAcompanhamento(newAcompanhamento)
    }
  }

  const addProduct = (products) => {
    const newCart = [...detail.cart, products]
    detail.setCart(newCart)
    clearInput()
  }

  const removeProduct = (product) => {
    const newCart = detail.cart.filter(e => product.id !== e.id)
    detail.setCart(newCart)
    UpdateProductCard(product)
  }

  const addProductCart = () => {
    if (category === 'Principais') {
      const newPrincipal = Principais.map(e =>
        productId === e.id ? { ...e, inCart: e.inCart ? false : true, quantity: quantidade } : e)
      setPrincipais(newPrincipal)
    } else {
      const newAcompanhamento = Acompanhamento.map(e =>
        productId === e.id ? { ...e, inCart: e.inCart ? false : true, quantity: quantidade } : e)
      setAcompanhamento(newAcompanhamento)
    }
    const newCart = detail.cart.map(e => productId === e.id ? { ...e, quantity: quantidade, inCart: true } : e)
    detail.setCart(newCart)
  }

  const twoFunctionOpen = (product, category) => {
    showPopUpFunction()
    setCategory(category)
    setProductid(product.id)
    addProduct(product, category)
  }

  const twoFunctionClose = (id) => {
    addProductCart(id)
    showPopUpFunction()
  }

  const showPopUpFunction = () => displawPopUp ? setPopUp(false) : setPopUp(true)

  return (
    <>

      <Header
        setUser={detail.setUser}
        setRestDetail={detail.setRestDetail}
        setHistory={detail.setHistory}
        setRest={detail.setRest}
        setOrder={detail.setOrder}
        setCart={detail.setCart} />

      <container.FullScreen>
        {
          loading ?
            <container.Loading>
              <LoadingCompoent />
            </container.Loading>
            :
            <>
              {detail.restDetail &&
                <>
                  <container.RestaurantData>
                    <container.RestaurantLogoImg src={detail.restDetail.restaurant.logoUrl} />
                    <container.RestName>{detail.restDetail.restaurant.name}</container.RestName>
                    <container.Paragrafo>{detail.restDetail.restaurant.category}</container.Paragrafo>
                    <container.Freight>
                      <container.Paragrafo><img src={time} alt={'icone de relógio'} /> {detail.restDetail.restaurant.deliveryTime} min</container.Paragrafo>
                      <container.Paragrafo><img src={delivery} alt={'icone de moto'} /> Frete R${detail.restDetail.restaurant.shipping}</container.Paragrafo>
                    </container.Freight>
                    <container.Paragrafo>{detail.restDetail.restaurant.address}</container.Paragrafo>
                  </container.RestaurantData>
                  <container.AllCards>
                    <h3>Principais</h3>
                    <container.Line>
                    </container.Line>
                    <ProductsCard
                      products={Principais}
                      twoFunction={twoFunctionOpen}
                      category={'Principais'}
                      removeProduct={removeProduct}
                    />
                  </container.AllCards>
                  <container.AllCards>
                    <h3>Acompanhamentos</h3>
                    <container.Line>
                    </container.Line>
                    <ProductsCard
                      products={Acompanhamento}
                      twoFunction={twoFunctionOpen}
                      category={'Acompanhamentos'}
                      removeProduct={removeProduct}
                    />
                  </container.AllCards>
                </>
              }
            </>
        }
        {showPopUpFunction &&
          <PopUpQuantity
            displawPopUp={displawPopUp}
            handleQuantidade={handleQuantidade}
            quantidade={quantidade}
            twoFunction={twoFunctionClose}
          />
        }
      </container.FullScreen>
      <Footer />
    </>
  )
}
