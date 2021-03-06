/**
 * Copyright © 2018 Elastic Path Software Inc. All rights reserved.
 *
 * This is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this license. If not, see
 *
 *     https://www.gnu.org/licenses/
 *
 *
 */

import React from 'react';

import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import { withRouter } from 'react-router';
import Modal from 'react-responsive-modal';
import CartLineItem from './cart.lineitem';
import { login } from '../utils/AuthService';
import { itemLookup, cortexFetchItemLookupForm } from '../utils/CortexLookup';
import { cortexFetch } from '../utils/Cortex';
import './quickorder.main.less';

const Config = require('Config');

class QuickOrderMain extends React.Component {
  static propTypes = {
    onAddToCart: PropTypes.func,
    isBuyItAgain: PropTypes.bool,
    productData: PropTypes.objectOf(PropTypes.any),
  }

  static defaultProps = {
    onAddToCart: () => { },
    isBuyItAgain: false,
    productData: {},
  }

  constructor(props) {
    super(props);
    this.state = {
      failedSubmit: false,
      productId: '',
      productDataInfo: {},
      itemQuantity: 1,
      addToCartFailedMessage: '',
      isLoading: false,
      itemConfiguration: {},
      openModal: false,
    };
    const { productData } = this.props;
    if (productData !== {}) {
      this.state = {
        productDataInfo: productData,
      };
    }
    this.addToCart = this.addToCart.bind(this);
    this.handleModalOpen = this.handleModalOpen.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleQuantityChange = this.handleQuantityChange.bind(this);
  }

  handleQuantityChange() {
    this.setState({
      isLoading: true,
    });
  }

  handleModalOpen() {
    this.setState({
      openModal: true,
    });
  }

  handleModalClose() {
    this.setState({
      openModal: false,
    });
  }

  addToCart(event) {
    const { onAddToCart } = this.props;
    const {
      itemQuantity, itemConfiguration, productId,
    } = this.state;
    this.setState({
      isLoading: true,
    });
    login().then(() => {
      cortexFetchItemLookupForm()
        .then(() => itemLookup(productId)
          .then((res) => {
            const addToCartLink = res._addtocartform[0].links.find(link => link.rel === 'addtodefaultcartaction');
            const body = {};
            body.quantity = itemQuantity;
            if (itemQuantity === undefined) {
              body.quantity = 1;
            }
            if (itemConfiguration) {
              body.configuration = itemConfiguration;
            }
            cortexFetch(addToCartLink.uri,
              {
                method: 'post',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: localStorage.getItem(`${Config.cortexApi.scope}_oAuthToken`),
                },
                body: JSON.stringify(body),
              })
              .then((resAddToCart) => {
                if (resAddToCart.status === 200 || resAddToCart.status === 201) {
                  this.setState({
                    isLoading: false,
                    productId: '',
                    itemQuantity: 1,
                  });
                  onAddToCart();
                } else {
                  let debugMessages = '';
                  resAddToCart.json().then((json) => {
                    for (let i = 0; i < json.messages.length; i++) {
                      debugMessages = debugMessages.concat(`- ${json.messages[i]['debug-message']} \n `);
                    }
                  }).then(() => this.setState({ addToCartFailedMessage: debugMessages }));
                }
              })
              .catch((error) => {
                // eslint-disable-next-line no-console
                console.error(error.message);
              });
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error.message);
          }));
    });
    event.preventDefault();
  }

  render() {
    const {
      failedSubmit, isLoading, addToCartFailedMessage, productId, itemQuantity, openModal, productDataInfo,
    } = this.state;
    const { isBuyItAgain } = this.props;
    if (isBuyItAgain) {
      return (
        <div style={{ display: 'block' }}>
          <button className="ep-btn small buy-it-again-btn" type="button" onClick={() => this.handleModalOpen()}>
            {intl.get('buy-it-again')}
          </button>
          <Modal open={openModal} onClose={this.handleModalClose} classNames={{ modal: 'buy-it-again-modal-content' }}>
            <div id="buy-it-again-modal">
              <div className="modal-content" id="simplemodal-container">
                <div className="modal-header">
                  <h2 className="modal-title">
                    {intl.get('buy-it-again')}
                  </h2>
                </div>
                <CartLineItem key={productId} item={productDataInfo} handleQuantityChange={() => { this.handleQuantityChange(); }} hideRemoveButton handleErrorMessage={this.handleErrorMessage} />
              </div>
            </div>
          </Modal>
          <div className="auth-feedback-container" id="product_display_item_add_to_cart_feedback_container" data-i18n="">
            {addToCartFailedMessage}
          </div>
          {
            (isLoading) ? (<div className="miniLoader" />) : ''
          }
        </div>
      );
    }
    return (
      <div className="quick-order-container" style={{ display: 'block' }}>
        <div>
          <h2 className="quick-order-title">
            {intl.get('quick-order-title')}
          </h2>
          <form className="form-horizontal" onSubmit={this.addToCart}>
            <div data-region="componentQuickOrderFormRegion">
              <div className="quick-order-form-container">
                <div className="feedback-label quick-order-form-feedback-container" data-region="componentQuickOrderFeedbackRegion">
                  {failedSubmit ? intl.get('failed-to-save-message') : ''}
                </div>
                <div className="form-group quick-order-forms">
                  <div className="quick-order-form-input">
                    <input id="quick_order_form_sku" className="form-control" type="text" placeholder={intl.get('quick-order-sku-title')} value={productId} onChange={e => this.setState({ productId: e.target.value })} />
                  </div>
                  <div className="quantity-col">
                    <input id="quick_order_form_quantity" className="quantity-select form-control" type="number" step="1" min="1" max="9999" placeholder="1" value={itemQuantity} onChange={e => this.setState({ itemQuantity: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
            <div className="form-group quick-order-btn-container quick-order-btn-container">
              <button className="ep-btn primary wide quick-order-add-to-cart" data-el-label="quickOrderForm.save" type="submit">
                {intl.get('add-to-cart')}
              </button>
            </div>
          </form>
          <div className="auth-feedback-container" id="product_display_item_add_to_cart_feedback_container" data-i18n="">
            {addToCartFailedMessage}
          </div>
          {
            (isLoading) ? (<div className="miniLoader" />) : ''
          }
        </div>
      </div>
    );
  }
}

export default withRouter(QuickOrderMain);
