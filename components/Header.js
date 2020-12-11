import React, { Component } from 'react';

class Header extends Component {

	render() {
		return (
			<div class="App-header">
				<h1>Online MarketPlace</h1>
				<ul>
					<li>Address: {this.props.accounts} </li>
					{(() => {
						if (this.props.MarketState)
							return <li>    |  Market is Open</li>
						else
							return <li>    |  Market is Close</li>
					})()
					}
				</ul>
			</div>
		);
	}
}

export default Header;
